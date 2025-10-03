-- Add 'current' status to exhibitions table
-- This script updates the CHECK constraint to allow 'current' status

-- First, drop the existing constraint
ALTER TABLE exhibitions DROP CONSTRAINT IF EXISTS exhibitions_status_check;

-- Add the new constraint that includes 'current'
ALTER TABLE exhibitions ADD CONSTRAINT exhibitions_status_check 
CHECK (status IN ('upcoming', 'current', 'past'));

-- Verify the constraint was added correctly
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'exhibitions'::regclass 
AND conname = 'exhibitions_status_check';

-- Optional: Update any existing exhibitions that might need the new status
-- (This is just an example - you can modify the WHERE clause as needed)
-- UPDATE exhibitions 
-- SET status = 'current' 
-- WHERE start_date <= CURRENT_DATE 
-- AND end_date >= CURRENT_DATE 
-- AND status = 'upcoming';

-- Show current exhibitions table structure
\d exhibitions;
