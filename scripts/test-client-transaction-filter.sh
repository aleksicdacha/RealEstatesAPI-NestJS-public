#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "🧪 TESTING clientTransactionType FILTER"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 1: Without filter (baseline)
echo "1. Testing without clientTransactionType filter..."
RESPONSE_NO_FILTER=$(curl -s 'http://localhost:3000/v1/properties/public?limit=50')
TOTAL_NO_FILTER=$(echo "$RESPONSE_NO_FILTER" | jq -r '.meta.totalItems' 2>/dev/null)

if [ ! -z "$TOTAL_NO_FILTER" ] && [ "$TOTAL_NO_FILTER" != "null" ]; then
    echo "   ✅ Without filter: $TOTAL_NO_FILTER properties"
else
    echo "   ❌ API not responding or error"
    echo "   Response: $RESPONSE_NO_FILTER"
    exit 1
fi

echo ""

# Test 2: With clientTransactionType=seller
echo "2. Testing with clientTransactionType=seller..."
RESPONSE_SELLER=$(curl -s 'http://localhost:3000/v1/properties/public?limit=50&clientTransactionType=seller')
TOTAL_SELLER=$(echo "$RESPONSE_SELLER" | jq -r '.meta.totalItems' 2>/dev/null)

if [ ! -z "$TOTAL_SELLER" ] && [ "$TOTAL_SELLER" != "null" ]; then
    echo "   ✅ With seller filter: $TOTAL_SELLER properties"

    if [ "$TOTAL_SELLER" -gt 0 ]; then
        echo ""
        echo "   📋 Sample property:"
        echo "$RESPONSE_SELLER" | jq '.items[0] | {code, propertyType, price, neighborhood}' 2>/dev/null
    else
        echo "   ⚠️  WARNING: 0 properties returned with seller filter"
        echo "   This might indicate:"
        echo "   - No properties have clients with transactionType='seller'"
        echo "   - Or there's still a filter issue"
    fi
else
    echo "   ❌ Error with seller filter"
    echo "   Response: $RESPONSE_SELLER"
fi

echo ""

# Test 3: With clientTransactionType=buyer
echo "3. Testing with clientTransactionType=buyer..."
RESPONSE_BUYER=$(curl -s 'http://localhost:3000/v1/properties/public?limit=50&clientTransactionType=buyer')
TOTAL_BUYER=$(echo "$RESPONSE_BUYER" | jq -r '.meta.totalItems' 2>/dev/null)

if [ ! -z "$TOTAL_BUYER" ] && [ "$TOTAL_BUYER" != "null" ]; then
    echo "   ✅ With buyer filter: $TOTAL_BUYER properties"
else
    echo "   ❌ Error with buyer filter"
fi

echo ""

# Test 4: Full URL from user's request
echo "4. Testing exact URL from user..."
RESPONSE_FULL=$(curl -s 'http://localhost:3000/v1/properties/public?page=1&limit=50&sortBy=createdAt&order=DESC&clientTransactionType=seller')
TOTAL_FULL=$(echo "$RESPONSE_FULL" | jq -r '.meta.totalItems' 2>/dev/null)

if [ ! -z "$TOTAL_FULL" ] && [ "$TOTAL_FULL" != "null" ]; then
    echo "   ✅ Full URL test: $TOTAL_FULL properties"
else
    echo "   ❌ Error with full URL"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 SUMMARY"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Total properties (no filter):        $TOTAL_NO_FILTER"
echo "Properties with seller filter:       $TOTAL_SELLER"
echo "Properties with buyer filter:        $TOTAL_BUYER"
echo ""

# Check database for reference
echo "📋 Database Check:"
echo "-------------------"
docker exec estates_postgres psql -U postgres -d estates -c "
SELECT
  c.\"transactionType\",
  COUNT(p.id) as property_count
FROM clients c
LEFT JOIN properties p ON p.\"clientId\" = c.id
WHERE p.status = 'active'
GROUP BY c.\"transactionType\"
ORDER BY c.\"transactionType\";
" 2>/dev/null

if [ "$TOTAL_SELLER" -gt 0 ] && [ "$TOTAL_SELLER" -eq "$TOTAL_NO_FILTER" ]; then
    echo ""
    echo "✅ TEST PASSED!"
    echo "   All active properties have clients with transactionType='seller'"
elif [ "$TOTAL_SELLER" -gt 0 ]; then
    echo ""
    echo "✅ FILTER WORKING!"
    echo "   Successfully filtered properties by clientTransactionType"
else
    echo ""
    echo "❌ TEST FAILED!"
    echo "   clientTransactionType filter returned 0 results"
    echo "   Expected at least some properties with seller clients"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
