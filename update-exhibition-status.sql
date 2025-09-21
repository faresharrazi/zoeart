-- Update exhibition status constraint to remove 'current' status
-- Run this in your Supabase SQL editor

-- First, update any existing 'current' status to 'upcoming'
UPDATE exhibitions 
SET status = 'upcoming' 
WHERE status = 'current';

-- Drop the existing constraint
ALTER TABLE exhibitions 
DROP CONSTRAINT IF EXISTS exhibitions_status_check;

-- Add the new constraint with only 'upcoming' and 'past'
ALTER TABLE exhibitions 
ADD CONSTRAINT exhibitions_status_check 
CHECK (status IN ('upcoming', 'past'));
