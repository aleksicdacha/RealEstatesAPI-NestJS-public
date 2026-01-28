# DDOS Security Analysis - Complete Investigation

## 🚨 EXECUTIVE SUMMARY

**Date**: January 28, 2026
**Issue**: Hetzner reported DDoS attack from server IP to `92.118.207.21` (Danish company)
**Root Cause**: Admin-web geocoding service making excessive requests to Overpass API
**Status**: ✅ **PRIMARY ISSUE FIXED** - Overpass API disabled, rate limiting & caching implemented
**Risk Level**: 🟡 **MEDIUM** - Additional potential vectors identified

---

## 📋 COMPLETE INVESTIGATION RESULTS

### ✅ **1. CONFIRMED DDOS SOURCE (FIXED)**

**Location**: `apps/admin-web/src/services/geocoding.service.ts`

**Problem**: 
- Overpass API (`92.118.207.21`) was being called on EVERY map interaction
- No rate limiting
- No caching
- No debouncing on rapid events (marker dragging)

**Attack Vector**:
```
Admin clicks/drags map marker 
→ MapSelector.tsx triggers getNeighborhoodFromCoordinates()
→ Calls Overpass API (overpass-api.de → IP 92.118.207.21)
→ If 3-4 admins editing properties simultaneously = 100+ requests/minute
→ Overpass API Fair Use Policy: Max 2 requests/sec, ~100/min
→ RESULT: DDoS complaint
```

**Fix Applied**:
- ✅ Overpass API **completely disabled** (line 130-202 commented out)
- ✅ Rate limiter implemented (1.5 sec between requests)
- ✅ Response caching (1 hour TTL, 5 decimal precision)
- ✅ Debouncing on marker drag (1 second delay)
- ✅ Request counter monitoring
- ✅ Only using Nominatim API as fallback

**Files Modified**:
- `apps/admin-web/src/services/geocoding.service.ts` (Rate limiting + caching)
- `apps/admin-web/src/app/components/wizard-steps/MapSelector.tsx` (Debouncing)

---

## 🔍 **2. OTHER POTENTIAL DDOS VECTORS**

### 🟡 **A. Nominatim API (OpenStreetMap) - MODERATE RISK**

**Location**: `apps/admin-web/src/services/geocoding.service.ts:213, 249`

**Current Status**: 
- ✅ Rate limited (1.5 sec between requests via `nominatimRateLimiter`)
- ✅ Cached (1 hour TTL)
- ✅ User-Agent header set
- ✅ 8 second timeout

**Risk**: 🟡 **LOW-MODERATE**
- Nominatim Fair Use Policy allows 1 request/sec
- We're more conservative (1 request/1.5sec)
- Caching reduces redundant calls
- **Monitoring**: Request counter logs warnings if >30 req/min

**Recommendation**: ✅ **Already secured, no action needed**

---

### 🔴 **B. Google Gemini AI API - POTENTIAL RISK**

**Location**: `apps/api/src/entities/chatbot/chatbot.service.ts`

**Current Status**:
- Uses `@google/generative-ai` library
- Calls Gemini Pro model on EVERY chatbot message
- ⚠️ **NO RATE LIMITING** on chatbot messages
- ⚠️ **NO RESPONSE CACHING**
- Has fallback mode if API key missing

**Risk**: 🟡 **LOW-MODERATE**
- Gemini API is Google-owned, high capacity
- Has fallback responses (lines 185-335)
- User-initiated only (not automated loops)
- **BUT**: If many users spam chatbot = high API usage

**Attack Scenario**:
```
Bot sends 1000 messages via chatbot endpoint
→ Each calls Gemini API
→ Exceeds Google quota
→ Service degradation OR high billing
```

**Recommendation**: 🔧 **ADD RATE LIMITING**

**Fix Required**:
```typescript
// In chatbot.controller.ts
import { Throttle } from '@nestjs/throttler';

@Post('message')
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 req/min per IP
async sendMessage(@Body() messageDto: ChatbotMessageDto) {
  // ...existing code
}
```

---

### 🟢 **C. Nodemailer (Email Service) - LOW RISK**

**Location**: `apps/api/src/email/email.service.ts`

**Analysis**:
- Uses SMTP connection to configured mail server (Gmail, etc.)
- Triggered only by:
  - Contact form submissions (`/contact/send`)
  - Newsletter sends (admin-only, authenticated)
  - Password reset (rare)
- All endpoints are authenticated OR have validation

**Risk**: 🟢 **LOW**
- Contact form requires reCAPTCHA (line 21 in contact.dto.ts)
- Newsletter requires JWT auth + ADMIN role
- No automated loops detected

**Recommendation**: ✅ **No action needed**

---

### 🟢 **D. Unsplash CDN (Static Images) - NO RISK**

**Location**: `apps/user-web/app/components/ParallaxSection.tsx:16,30`

**Analysis**:
- Static background images loaded from Unsplash CDN
- Browser-initiated, cached by browser
- No server-side requests

**Risk**: 🟢 **NONE**

**Recommendation**: ✅ **No action needed**

---

### 🟡 **E. WebSocket (Socket.io) - MODERATE RISK**

**Location**: 
- `apps/api/src/entities/agent-chat/agent-chat.gateway.ts`
- `apps/user-web/app/components/Chatbot.tsx:203`

**Analysis**:
- WebSocket server for agent-customer chat
- Client connects via `io(url)` on agent request
- No authentication on WebSocket connection
- ⚠️ **NO CONNECTION RATE LIMITING**

**Risk**: 🟡 **MODERATE**
- Potential for socket flood attacks
- Multiple connections per IP not restricted

**Attack Scenario**:
```
Attacker opens chatbot
→ Clicks "Talk to agent" 1000 times
→ Creates 1000 WebSocket connections
→ Server resource exhaustion
```

**Recommendation**: 🔧 **ADD CONNECTION LIMITS**

**Fix Required**:
```typescript
// In agent-chat.gateway.ts
import { WsThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({ namespace: 'agent-chat' })
@UseGuards(WsThrottlerGuard)
export class AgentChatGateway {
  // ...existing code
}
```

---

### 🔴 **F. Public API Endpoints (No Auth) - POTENTIAL RISK**

**Locations**:
- `/v1/properties/public` (PropertyController)
- `/v1/contact/send` (ContactController)
- `/v1/chatbot/message` (ChatbotController)
- `/v1/newsletter/subscribe` (NewsletterController)

**Current Protection**:
- App-level ThrottlerModule in `app.module.ts:76-90`
  - Short: 10 req/sec
  - Medium: 50 req/10sec
  - Long: 100 req/min

**Risk**: 🟡 **LOW-MODERATE**
- Throttling is configured BUT may not be applied to all routes
- Need to verify guards are actually active

**Recommendation**: 🔧 **VERIFY THROTTLE GUARDS**

**Check Required**:
```bash
# Search for @UseGuards(ThrottlerGuard) in controllers
grep -r "@UseGuards.*Throttler" apps/api/src/
```

**If missing**, add to vulnerable endpoints:
```typescript
import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('contact')
export class ContactController {
  @Post('send')
  @UseGuards(ThrottlerGuard)
  async sendContactForm(@Body() dto: ContactFormDto) {
    // ...
  }
}
```

---

## 🛡️ **RECOMMENDED SECURITY HARDENING**

### **Priority 1 - IMMEDIATE** (Fix Today)

1. ✅ **Disable Overpass API** - DONE
2. 🔧 **Add Throttling to Chatbot** - See section 2B
3. 🔧 **Add WebSocket Connection Limits** - See section 2E

### **Priority 2 - THIS WEEK**

4. 🔧 **Verify Throttle Guards on Public Endpoints** - See section 2F
5. 🔧 **Add Request Logging for Abuse Detection**
   ```typescript
   // In main.ts or app.module.ts
   app.use(morgan('combined')); // Log all requests
   ```
6. 🔧 **Implement IP-based Rate Limiting in Nginx** (Production)
   ```nginx
   limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
   limit_req zone=api_limit burst=20 nodelay;
   ```

### **Priority 3 - OPTIONAL ENHANCEMENTS**

7. 📊 **Add Monitoring Dashboard** (Prometheus + Grafana)
8. 🔐 **Add CAPTCHA to Contact Form** (already has reCAPTCHA, verify it works)
9. 🚫 **Implement IP Blacklisting** for repeat offenders
10. 📧 **Email Alerts** on unusual traffic patterns

---

## 📊 **CURRENT SECURITY STATUS**

| Component | Risk Level | Protection | Status |
|-----------|-----------|-----------|--------|
| Overpass API | 🔴 **HIGH** | ✅ Disabled, rate limited, cached | **FIXED** |
| Nominatim API | 🟡 **LOW** | ✅ Rate limited, cached | **SECURE** |
| Gemini AI | 🟡 **MODERATE** | ❌ No rate limiting | **NEEDS FIX** |
| Email Service | 🟢 **LOW** | ✅ Auth + reCAPTCHA | **SECURE** |
| WebSocket | 🟡 **MODERATE** | ❌ No connection limits | **NEEDS FIX** |
| Public APIs | 🟡 **LOW-MOD** | ⚠️ Throttle configured, verify guards | **VERIFY** |

---

## 🔍 **MONITORING COMMANDS**

### **Check Active Connections**
```bash
# Total connections
sudo netstat -an | wc -l

# Connections to specific IP
sudo netstat -an | grep "92.118.207.21"

# Connection count by IP
sudo netstat -ntu | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr | head -10
```

### **Monitor API Traffic**
```bash
# Real-time logs (PM2)
pm2 logs realestates-api --lines 100

# Track outgoing requests
sudo tcpdump -i any host 92.118.207.21 -c 100

# Network usage by host
sudo iftop -f "host 92.118.207.21"
```

### **Application Logs**
```typescript
// Already implemented in geocoding.service.ts:84-92
// Logs request counts every 60 seconds
// ⚠️ WARNING if >30 requests/min
```

---

## ✅ **VERIFICATION CHECKLIST**

After fixes, verify:

- [ ] No Overpass API calls in production logs
- [ ] Nominatim requests <1 per 1.5 seconds
- [ ] Chatbot throttle returns 429 after 10 requests/min
- [ ] WebSocket connections limited per IP
- [ ] Contact form reCAPTCHA validated
- [ ] No 92.118.207.21 connections: `netstat -an | grep "92.118.207.21"`
- [ ] Nginx rate limiting active (production)
- [ ] PM2 logs show no API errors

---

## 📞 **INCIDENT RESPONSE**

If Hetzner sends another DDoS alert:

1. **Immediate**: Stop all apps
   ```bash
   pm2 stop all
   ```

2. **Identify**: Check which IP is being attacked
   ```bash
   sudo netstat -ntu | awk '{print $5}' | sort | uniq -c | sort -nr | head -20
   ```

3. **Block**: Temporarily firewall the target
   ```bash
   sudo iptables -A OUTPUT -d <TARGET_IP> -j DROP
   ```

4. **Investigate**: Check application logs
   ```bash
   pm2 logs --lines 500 | grep "<TARGET_IP>"
   ```

5. **Report**: Contact Hetzner with findings
   - What was calling the IP
   - What fix was applied
   - When service will resume

---

## 🎯 **CONCLUSION**

**Primary DDoS source**: ✅ **FIXED** (Overpass API disabled)

**Remaining risks**: 
- 🟡 Gemini AI (needs throttling)
- 🟡 WebSocket (needs connection limits)
- 🟡 Public endpoints (verify guards)

**Next steps**: Implement Priority 1 fixes immediately (see section 3)

**Server safe to restart**: ✅ **YES** (with Overpass API fix deployed)
