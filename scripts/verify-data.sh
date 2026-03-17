#!/bin/bash

echo "🔍 COMPLETE DATA VERIFICATION"
echo "=============================="
echo ""

# Check database counts
echo "📊 Database Counts:"
echo "-------------------"

USERS=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
CLIENTS=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM clients;" 2>/dev/null | tr -d ' ')
PROPERTIES=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM properties;" 2>/dev/null | tr -d ' ')
IMAGES=$(docker exec estates_postgres psql -U postgres -d estates -t -c "SELECT COUNT(*) FROM property_images;" 2>/dev/null | tr -d ' ')

echo "✅ Users:      $USERS"
echo "✅ Clients:    $CLIENTS"
echo "✅ Properties: $PROPERTIES"
echo "✅ Images:     $IMAGES"
echo ""

# Show property details
echo "🏠 Property Details:"
echo "--------------------"
docker exec estates_postgres psql -U postgres -d estates -c "
SELECT
    code,
    \"propertyType\" as type,
    price,
    area,
    neighborhood,
    (SELECT COUNT(*) FROM property_images WHERE \"propertyId\" = properties.id) as images
FROM properties
ORDER BY \"specialOffer\";" 2>/dev/null

echo ""
echo "📸 Image Details:"
echo "-----------------"
docker exec estates_postgres psql -U postgres -d estates -c "
SELECT
    pi.url,
    pi.\"order\",
    pi.\"isFavorite\",
    p.code as property_code
FROM property_images pi
JOIN properties p ON pi.\"propertyId\" = p.id
ORDER BY p.code, pi.\"order\";" 2>/dev/null

echo ""
echo "🧪 API Test:"
echo "------------"

# Test login
echo -n "Login: "
TOKEN=$(curl -s -X POST http://localhost:3000/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' 2>/dev/null | jq -r '.accessToken' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
    echo "✅ Working"
else
    echo "❌ Failed"
    exit 1
fi

# Test properties endpoint
echo -n "Properties API: "
PROPS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/v1/properties 2>/dev/null)
PROPS_COUNT=$(echo "$PROPS_RESPONSE" | jq '.data | length' 2>/dev/null)

if [ "$PROPS_COUNT" = "$PROPERTIES" ]; then
    echo "✅ $PROPS_COUNT properties returned"
else
    echo "⚠️  Expected $PROPERTIES, got $PROPS_COUNT"
fi

# Test public endpoint
echo -n "Public API: "
PUBLIC_RESPONSE=$(curl -s http://localhost:3000/v1/properties/public 2>/dev/null)
PUBLIC_COUNT=$(echo "$PUBLIC_RESPONSE" | jq '.data | length' 2>/dev/null)

if [ "$PUBLIC_COUNT" = "$PROPERTIES" ]; then
    echo "✅ $PUBLIC_COUNT properties returned"
else
    echo "⚠️  Expected $PROPERTIES, got $PUBLIC_COUNT"
fi

echo ""
echo "✅ VERIFICATION COMPLETE"
echo "========================"
echo ""
echo "🌐 Next Steps:"
echo "   1. Open Admin Panel: http://localhost:3001"
echo "   2. Login: admin / admin123"
echo "   3. View $PROPERTIES properties with $IMAGES images"
echo "   4. Open User Website: http://localhost:3002"
echo ""
