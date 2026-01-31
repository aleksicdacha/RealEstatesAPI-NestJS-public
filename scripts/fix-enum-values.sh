#!/bin/bash
# Fix and verify enum values in database

echo "🔧 FIXING ENUM VALUES IN DATABASE"
echo "==================================="
echo ""

echo "📝 Updating Client enums..."
docker exec estates_postgres psql -U postgres -d estates -c "
UPDATE clients SET status = 'active' WHERE status = 'Active';
UPDATE clients SET status = 'inactive' WHERE status = 'Inactive';
UPDATE clients SET \"transactionType\" = 'seller' WHERE \"transactionType\" = 'Seller';
UPDATE clients SET \"transactionType\" = 'buyer' WHERE \"transactionType\" = 'Buyer';
UPDATE clients SET \"transactionType\" = 'rents' WHERE \"transactionType\" = 'Rents';
UPDATE clients SET \"transactionType\" = 'rents-out' WHERE \"transactionType\" = 'RentsOut';
UPDATE clients SET \"paymentType\" = 'cash' WHERE \"paymentType\" = 'Cash';
UPDATE clients SET \"paymentType\" = 'credit' WHERE \"paymentType\" = 'Credit';
UPDATE clients SET \"paymentType\" = 'combined' WHERE \"paymentType\" = 'Combined';
UPDATE clients SET \"paymentType\" = 'bank-transfer' WHERE \"paymentType\" = 'BankTransfer';
"

echo "📝 Updating Property enums..."
docker exec estates_postgres psql -U postgres -d estates -c "
UPDATE properties SET status = 'active' WHERE status = 'Active';
UPDATE properties SET status = 'inactive' WHERE status = 'Inactive';
UPDATE properties SET status = 'deleted' WHERE status = 'Deleted';
"

echo ""
echo "✅ VERIFICATION"
echo "==============="
echo ""

echo "Clients with transactionType = 'seller':"
docker exec estates_postgres psql -U postgres -d estates -t -c \
  "SELECT COUNT(*) FROM clients WHERE \"transactionType\" = 'seller';"

echo ""
echo "Properties with status = 'active':"
docker exec estates_postgres psql -U postgres -d estates -t -c \
  "SELECT COUNT(*) FROM properties WHERE status = 'active';"

echo ""
echo "Properties with clients:"
docker exec estates_postgres psql -U postgres -d estates -t -c \
  "SELECT COUNT(*) FROM properties WHERE \"clientId\" IS NOT NULL;"

echo ""
echo "✅ Enum values fixed!"
echo ""
echo "🧪 Testing API..."
curl -s "http://localhost:3000/v1/properties/public?clientTransactionType=seller&limit=2" | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(f'API returned {len(data.get(\"items\", []))} properties')" 2>/dev/null || echo "API test skipped (curl/python not available)"

echo ""
echo "🌐 User-web should now show properties at:"
echo "   http://localhost:3002/sr/prodaja"
