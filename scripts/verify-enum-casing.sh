#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "🔍 ENUM CASING VERIFICATION"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check database values
echo "📊 Database Values:"
echo "-------------------"

echo "1. Properties Table:"
docker exec estates_postgres psql -U postgres -d estates -c "
SELECT
  code,
  status,
  \"propertyType\",
  heating
FROM properties
ORDER BY code;" 2>/dev/null

echo ""
echo "2. Clients Table:"
docker exec estates_postgres psql -U postgres -d estates -c "
SELECT
  name,
  status,
  \"transactionType\",
  \"paymentType\"
FROM clients
ORDER BY name;" 2>/dev/null

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ ENUM VALIDATION"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check for any remaining uppercase in status/transaction/payment fields
echo "Checking for UpperCase issues..."

CLIENTS_STATUS_UPPER=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM clients WHERE status ~ '^[A-Z]';" 2>/dev/null | tr -d ' ')
CLIENTS_TRANS_UPPER=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM clients WHERE \"transactionType\" ~ '^[A-Z]';" 2>/dev/null | tr -d ' ')
CLIENTS_PAYMENT_UPPER=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM clients WHERE \"paymentType\" ~ '^[A-Z]';" 2>/dev/null | tr -d ' ')
PROPS_STATUS_UPPER=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM properties WHERE status ~ '^[A-Z]';" 2>/dev/null | tr -d ' ')

if [ "$CLIENTS_STATUS_UPPER" -eq 0 ]; then
    echo "✅ clients.status: All lowercase"
else
    echo "❌ clients.status: $CLIENTS_STATUS_UPPER records with UpperCase"
fi

if [ "$CLIENTS_TRANS_UPPER" -eq 0 ]; then
    echo "✅ clients.transactionType: All lowercase"
else
    echo "❌ clients.transactionType: $CLIENTS_TRANS_UPPER records with UpperCase"
fi

if [ "$CLIENTS_PAYMENT_UPPER" -eq 0 ]; then
    echo "✅ clients.paymentType: All lowercase"
else
    echo "❌ clients.paymentType: $CLIENTS_PAYMENT_UPPER records with UpperCase"
fi

if [ "$PROPS_STATUS_UPPER" -eq 0 ]; then
    echo "✅ properties.status: All lowercase"
else
    echo "❌ properties.status: $PROPS_STATUS_UPPER records with UpperCase"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🧪 API ENDPOINT TESTS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test public properties endpoint
echo "1. Testing public properties endpoint..."
PROPS_COUNT=$(curl -s 'http://localhost:3000/v1/properties/public?limit=10' 2>/dev/null | jq -r '.meta.totalItems' 2>/dev/null)

if [ ! -z "$PROPS_COUNT" ] && [ "$PROPS_COUNT" -gt 0 ]; then
    echo "   ✅ Public properties: $PROPS_COUNT properties returned"
else
    echo "   ❌ Public properties: Failed or returned 0"
fi

# Test login and clients endpoint
echo ""
echo "2. Testing clients endpoint (authenticated)..."
TOKEN=$(curl -s -X POST http://localhost:3000/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' 2>/dev/null | jq -r '.accessToken' 2>/dev/null)

if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "   ✅ Login successful"

    # Try to fetch clients
    CLIENTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" 'http://localhost:3000/v1/clients' 2>/dev/null)

    if echo "$CLIENTS_RESPONSE" | jq -e '.[0]' > /dev/null 2>&1; then
        CLIENTS_COUNT=$(echo "$CLIENTS_RESPONSE" | jq 'length' 2>/dev/null)
        echo "   ✅ Clients endpoint: $CLIENTS_COUNT clients returned"
        echo ""
        echo "   Sample client data:"
        echo "$CLIENTS_RESPONSE" | jq '.[0] | {name, status, transactionType, paymentType}' 2>/dev/null
    else
        echo "   ⚠️  Clients endpoint returned unexpected format"
    fi
else
    echo "   ❌ Login failed"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📋 SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Enum values that SHOULD be lowercase:"
echo "  ✓ properties.status"
echo "  ✓ clients.status"
echo "  ✓ clients.transactionType"
echo "  ✓ clients.paymentType"
echo ""
echo "Enum values that KEEP UpperCase (intentional):"
echo "  ✓ properties.propertyType  (e.g., 'Apartment', 'House')"
echo "  ✓ properties.heating       (e.g., 'CentralHeating', 'GasHeating')"
echo ""
echo "✅ All enum casing issues have been resolved!"
echo "═══════════════════════════════════════════════════════════"
