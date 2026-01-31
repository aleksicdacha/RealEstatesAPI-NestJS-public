-- Fix property status casing to match PropertyStatus enum
-- This ensures the public API works correctly

-- Update properties with capitalized status to lowercase
UPDATE properties
SET status = LOWER(status)
WHERE status IN ('Active', 'Inactive', 'Deleted', 'Sold', 'Reserved');

-- Verify the changes
SELECT
  code,
  status,
  CASE
    WHEN status IN ('active', 'inactive', 'deleted', 'sold', 'reserved') THEN '✅ Correct'
    ELSE '❌ Needs Fix'
  END as status_check
FROM properties
ORDER BY code;
