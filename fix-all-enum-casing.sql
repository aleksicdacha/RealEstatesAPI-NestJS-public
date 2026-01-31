-- =========================================
-- FIX ALL ENUM CASING ISSUES
-- =========================================
-- This script converts all UpperCase enum values to lowercase
-- to match the TypeScript enum definitions

BEGIN;

-- =========================================
-- 1. FIX CLIENTS TABLE
-- =========================================

-- Fix client status: Active → active, Inactive → inactive
UPDATE clients
SET status = LOWER(status)
WHERE status IN ('Active', 'Inactive', 'Deleted');

-- Fix transactionType: Seller → seller, Buyer → buyer, etc.
UPDATE clients
SET "transactionType" = LOWER("transactionType")
WHERE "transactionType" IN ('Seller', 'Buyer', 'Rents');

UPDATE clients
SET "transactionType" = 'rents-out'
WHERE "transactionType" = 'RentsOut';

-- Fix paymentType: Cash → cash, Credit → credit, Combined → combined
UPDATE clients
SET "paymentType" = LOWER("paymentType")
WHERE "paymentType" IN ('Cash', 'Credit', 'Combined');

UPDATE clients
SET "paymentType" = 'bank-transfer'
WHERE "paymentType" = 'BankTransfer';

-- =========================================
-- 2. FIX PROPERTIES TABLE (status only)
-- =========================================
-- Note: propertyType and heating intentionally use UpperCase per enum definition

-- Fix property status: Active → active, Inactive → inactive
UPDATE properties
SET status = LOWER(status)
WHERE status IN ('Active', 'Inactive', 'Deleted', 'Sold', 'Reserved');

-- =========================================
-- VERIFICATION QUERIES
-- =========================================

-- Show updated clients
SELECT
  'CLIENTS' as table_name,
  COUNT(*) as total,
  status,
  "transactionType",
  "paymentType"
FROM clients
GROUP BY status, "transactionType", "paymentType"
ORDER BY status;

-- Show updated properties
SELECT
  'PROPERTIES' as table_name,
  COUNT(*) as total,
  status,
  "propertyType"
FROM properties
GROUP BY status, "propertyType"
ORDER BY status;

-- Check for any remaining UpperCase values in status fields
SELECT
  'REMAINING_UPPERCASE' as check_type,
  (SELECT COUNT(*) FROM clients WHERE status ~ '[A-Z]') as clients_status,
  (SELECT COUNT(*) FROM properties WHERE status ~ '[A-Z]') as properties_status;

COMMIT;

-- =========================================
-- EXPECTED RESULTS
-- =========================================
-- clients.status: 'active', 'inactive', 'deleted'
-- clients.transactionType: 'seller', 'buyer', 'rents', 'rents-out'
-- clients.paymentType: 'cash', 'credit', 'combined', 'bank-transfer'
-- properties.status: 'active', 'inactive', 'deleted', 'sold', 'reserved'
-- properties.propertyType: 'Apartment', 'House', etc. (keeps UpperCase)
-- properties.heating: 'CentralHeating', 'GasHeating', etc. (keeps UpperCase)
