#!/bin/bash

echo "🔍 TESTING PUBLIC PROPERTIES ENDPOINT"
echo "====================================="
echo ""

# Test public endpoint
echo "📡 Testing: GET /v1/properties/public?limit=10&page=1"
echo ""

RESPONSE=$(curl -s 'http://localhost:3000/v1/properties/public?limit=10&page=1')

# Check if we got items
ITEM_COUNT=$(echo "$RESPONSE" | jq '.meta.totalItems' 2>/dev/null)

if [ "$ITEM_COUNT" -gt 0 ]; then
    echo "✅ SUCCESS! Found $ITEM_COUNT properties"
    echo ""
    echo "📋 Properties:"
    echo "$RESPONSE" | jq '.items[] | {code: .code, type: .propertyType, price: .price, images: (.images | length)}'
    echo ""
    echo "📊 Pagination:"
    echo "$RESPONSE" | jq '.meta'
else
    echo "❌ FAILED! No properties returned"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | jq '.'
fi

echo ""
echo "🧪 Testing single property endpoint"
echo "===================================="

# Get first property ID
FIRST_ID=$(echo "$RESPONSE" | jq -r '.items[0].id' 2>/dev/null)

if [ ! -z "$FIRST_ID" ] && [ "$FIRST_ID" != "null" ]; then
    echo "Testing: GET /v1/properties/public/$FIRST_ID"
    SINGLE_RESPONSE=$(curl -s "http://localhost:3000/v1/properties/public/$FIRST_ID")

    if echo "$SINGLE_RESPONSE" | jq -e '.code' > /dev/null 2>&1; then
        echo "✅ Single property endpoint works!"
        echo "$SINGLE_RESPONSE" | jq '{code, propertyType, price, images: (.images | length)}'
    else
        echo "❌ Single property endpoint failed"
    fi
else
    echo "⚠️  Skipping - no properties to test"
fi

echo ""
echo "✅ PUBLIC ENDPOINT TEST COMPLETE"
