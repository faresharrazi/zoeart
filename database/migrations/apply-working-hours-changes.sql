-- Apply Working Hours Changes
-- Run this script in your PostgreSQL database

-- 1. Create working_hours table
CREATE TABLE IF NOT EXISTS working_hours (
    id SERIAL PRIMARY KEY,
    day VARCHAR(20) NOT NULL,
    time_frame VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert default working hours
INSERT INTO working_hours (day, time_frame, is_active) VALUES 
('Monday', 'Closed', true),
('Tuesday', '10:00 AM - 6:00 PM', true),
('Wednesday', '10:00 AM - 6:00 PM', true),
('Thursday', '10:00 AM - 6:00 PM', true),
('Friday', '10:00 AM - 6:00 PM', true),
('Saturday', '10:00 AM - 6:00 PM', true),
('Sunday', '12:00 PM - 5:00 PM', true)
ON CONFLICT DO NOTHING;

-- 3. Remove footerDescription and galleryHours from home page content
UPDATE page_content 
SET content = content - 'footerDescription' - 'galleryHours'
WHERE page_name = 'home';

-- 4. Create trigger for working_hours updated_at (if the function doesn't exist, create it first)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for working_hours
DROP TRIGGER IF EXISTS update_working_hours_updated_at ON working_hours;
CREATE TRIGGER update_working_hours_updated_at 
BEFORE UPDATE ON working_hours 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Verify changes
SELECT 'Working hours table created' as status;
SELECT COUNT(*) as working_hours_count FROM working_hours;
SELECT page_name, content FROM page_content WHERE page_name = 'home';
