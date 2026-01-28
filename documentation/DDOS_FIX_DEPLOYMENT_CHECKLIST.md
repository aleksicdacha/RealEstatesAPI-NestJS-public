# DDoS Fix Deployment Checklist

## 🚨 CRITICAL SECURITY FIXES APPLIED

**Date**: January 28, 2026  
**Issue**: DDoS attack to IP `92.118.207.21` (Overpass API)  
**Status**: ✅ **READY FOR DEPLOYMENT**

---

## 📋 CHANGES MADE

### 1. ✅ **Overpass API Disabled** (Primary Fix)
**File**: `apps/admin-web/src/services/geocoding.service.ts`

- Overpass API calls completely disabled (lines 130-202)
- Rate limiter implemented (1.5 sec between requests)
- Response caching added (1 hour TTL)
- Request counter monitoring active
- Only using Nominatim as fallback

### 2. ✅ **Newsletter Batch Processing** (NEW - Prevents Email Flooding)
**File**: `apps/api/src/entities/newsletter-subscriber/newsletter-subscriber.service.ts`

- Added batch processing: 50 emails per batch
- Added 2-second delay between batches
- Prevents email server blacklisting
- Prevents SMTP server rate limiting
- Added detailed logging for newsletter sending
- Example: 1000 subscribers = 20 batches over ~40 seconds (safe rate)

### 3. ✅ **Chatbot Rate Limiting**
**File**: `apps/api/src/entities/chatbot/chatbot.controller.ts`

- Added `@UseGuards(ThrottlerGuard)`
- `/chatbot/message`: 10 requests/min per IP
- `/chatbot/connect-agent`: 3 requests/5min per IP

### 4. ✅ **Contact Form Rate Limiting**
**File**: `apps/api/src/contact/contact.controller.ts`

- Added `@UseGuards(ThrottlerGuard)`
- `/contact/send`: 3 submissions/5min per IP

### 5. ✅ **Newsletter Subscription Rate Limiting**
**File**: `apps/api/src/entities/newsletter-subscriber/newsletter-subscriber.controller.ts`

- Added `@UseGuards(ThrottlerGuard)`
- `/newsletter/subscribe`: 5 subscriptions/5min per IP

### 6. ✅ **WebSocket Connection Limiting**
**File**: `apps/api/src/entities/agent-chat/agent-chat.gateway.ts`

- Added `ConnectionRateLimiter` class
- Max 5 connections per IP per minute
- Automatic cleanup every 5 minutes
- IP-based tracking with proper headers

---

## 🚀 DEPLOYMENT STEPS

### **Step 1: Backup Current Code**
```bash
cd ~/RealEstatesAPI-NestJS
git stash
git branch backup-before-ddos-fix-$(date +%Y%m%d)
```

### **Step 2: Pull Latest Changes**
```bash
git pull origin main
# or if changes are on local:
git add .
git commit -m "Security: Add rate limiting and disable Overpass API to prevent DDoS"
git push origin main
```

### **Step 3: Stop Services**
```bash
pm2 stop all
```

### **Step 4: Install Dependencies** (if needed)
```bash
# Backend
cd apps/api
npm install
cd ../..

# Admin-web
cd apps/admin-web
npm install
cd ../..
```

### **Step 5: Build Applications**
```bash
# Build all apps
npm run build

# Or individually:
cd apps/api && npm run build && cd ../..
cd apps/admin-web && npm run build && cd ../..
cd apps/user-web && npm run build && cd ../..
```

### **Step 6: Verify No Outgoing Connections to Overpass**
```bash
# Before starting, verify no existing connections
sudo netstat -an | grep "92.118.207.21"
# Should return nothing

# Block Overpass API temporarily (optional paranoid measure)
sudo iptables -A OUTPUT -d 92.118.207.21 -j REJECT
```

### **Step 7: Start Services**
```bash
# Start API
cd apps/api
pm2 start dist/main.js --name "realestates-api" --env production

# Start Admin-web
cd apps/admin-web
pm2 start npm --name "realestates-admin" -- start

# Start User-web
cd apps/user-web
pm2 start npm --name "realestates-user" -- start

# Save PM2 configuration
pm2 save
```

### **Step 8: Monitor for 10 Minutes**
```bash
# Watch logs in real-time
pm2 logs --lines 50

# Monitor connections
watch -n 5 'sudo netstat -an | grep -E "3000|3001|3002|92.118.207.21"'

# Check for any external API calls
sudo tcpdump -i any host 92.118.207.21 -c 10
# Should timeout (no packets)
```

### **Step 9: Test Rate Limiting**
```bash
# Test chatbot throttling (from another machine or curl)
for i in {1..15}; do
  curl -X POST http://46.224.231.217:3000/v1/chatbot/message \
    -H "Content-Type: application/json" \
    -d '{"message":"test","locale":"sr"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 1
done
# Should see 429 (Too Many Requests) after 10th request

# Test contact form throttling
for i in {1..5}; do
  curl -X POST http://46.224.231.217:3000/v1/contact/send \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com","subject":"Test","message":"Test","recaptchaToken":"test"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 1
done
# Should see 429 after 3rd request
```

### **Step 10: Remove Firewall Block** (if applied in Step 6)
```bash
sudo iptables -D OUTPUT -d 92.118.207.21 -j REJECT
```

---

## ✅ VERIFICATION CHECKLIST

After deployment, verify:

- [ ] All 3 apps running: `pm2 status`
- [ ] No errors in logs: `pm2 logs --lines 100 --nostream`
- [ ] Admin-web accessible: http://46.224.231.217:3001
- [ ] User-web accessible: http://46.224.231.217:3002
- [ ] API responding: `curl http://46.224.231.217:3000/v1/properties/public`
- [ ] Chatbot throttling works (test with 15 rapid requests)
- [ ] Contact form throttling works (test with 5 rapid requests)
- [ ] WebSocket connects successfully (open chatbot, request agent)
- [ ] No connections to 92.118.207.21: `sudo netstat -an | grep "92.118.207.21"`
- [ ] Geocoding logs show "Overpass API disabled": Check admin logs when editing property
- [ ] Rate limiter logs visible: `pm2 logs realestates-api | grep "rate limit"`
- [ ] Newsletter batch logging works: Send test newsletter and check logs for "Processing batch"

---

## 🔍 MONITORING (First 24 Hours)

### **Hourly Checks**
```bash
# 1. Check connection count
sudo netstat -an | wc -l

# 2. Check for Overpass connections
sudo netstat -an | grep "92.118.207.21" || echo "✅ No Overpass connections"

# 3. Check for throttle warnings
pm2 logs realestates-api --lines 100 | grep -E "rate limit|Too Many Requests" || echo "✅ No abuse detected"

# 4. Check error count
pm2 logs --lines 500 --nostream | grep -c "ERROR"
```

### **Daily Summary**
```bash
# Generate traffic report
echo "=== API Request Summary ==="
pm2 logs realestates-api --lines 5000 --nostream | grep -E "POST|GET" | awk '{print $NF}' | sort | uniq -c | sort -nr | head -20

echo "=== Throttle Events ==="
pm2 logs realestates-api --lines 5000 --nostream | grep "Too Many Requests" | wc -l

echo "=== WebSocket Connections ==="
pm2 logs realestates-api --lines 5000 --nostream | grep "Client connected" | wc -l
```

---

## 🚨 ROLLBACK PROCEDURE (If Issues Occur)

### **If Services Won't Start**
```bash
# Stop all
pm2 stop all
pm2 delete all

# Restore from backup
git checkout backup-before-ddos-fix-*

# Rebuild
npm run build

# Start again
# (follow Step 7 from deployment)
```

### **If DDoS Alert Repeats**
```bash
# Immediate response
pm2 stop all

# Block Overpass permanently
sudo iptables -A OUTPUT -d 92.118.207.21 -j DROP
sudo iptables-save > /etc/iptables/rules.v4

# Investigate
sudo tcpdump -i any -w /tmp/traffic.pcap -c 1000
# Analyze: tcpdump -r /tmp/traffic.pcap | grep "92.118.207.21"

# Contact Hetzner with evidence
echo "DDoS source identified and blocked. Services restarting with additional safeguards."
```

---

## 📊 EXPECTED BEHAVIOR AFTER FIX

### ✅ **Normal Operation**
- Geocoding uses **only Nominatim API** (openstreetmap.org)
- Max 1 geocoding request per 1.5 seconds
- Chatbot limited to 10 messages/min per user
- Contact form limited to 3 submissions/5min
- WebSocket max 5 connections/min per IP
- Responses cached for 1 hour
- Newsletter sends in batches of 50 with 2-second delays

### ✅ **Under Attack**
- HTTP 429 "Too Many Requests" returned
- Excessive connections auto-rejected
- Logs show: `⚠️ WARNING: High API usage detected!`
- No impact on legitimate users

### ❌ **What Should NEVER Happen**
- ❌ Connections to 92.118.207.21 (Overpass API)
- ❌ More than 40 Nominatim requests per minute
- ❌ Unlimited chatbot spam
- ❌ Unlimited WebSocket connections
- ❌ Sending 100+ emails without delays (now batched)

---

## 📞 SUPPORT CONTACTS

**If issues arise:**

1. **Check documentation**: `/documentation/DDOS_SECURITY_ANALYSIS.md`
2. **Check logs**: `pm2 logs --lines 500`
3. **Emergency stop**: `pm2 stop all && sudo iptables -A OUTPUT -d 92.118.207.21 -j DROP`

---

## 🎯 SUCCESS CRITERIA

Deployment is successful when:

1. ✅ All 3 services running without errors
2. ✅ No connections to 92.118.207.21 for 1 hour
3. ✅ Rate limiting returns 429 when tested
4. ✅ Admin can still edit properties (using Nominatim)
5. ✅ Chatbot responds normally (within rate limits)
6. ✅ WebSocket chat works (within connection limits)
7. ✅ No Hetzner alerts for 24 hours

---

**Deployment prepared by**: AI Security Audit  
**Review required by**: System Administrator  
**Estimated downtime**: 5-10 minutes  
**Risk level**: 🟢 **LOW** (conservative fixes, no data changes)
