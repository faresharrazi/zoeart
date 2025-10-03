-- Create about_blocks table for better data management
CREATE TABLE IF NOT EXISTS about_blocks (
    id SERIAL PRIMARY KEY,
    block_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'block1', 'block2', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT, -- Short description/summary
    content TEXT NOT NULL,
    is_visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0, -- for ordering blocks (rank)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert the existing blocks from the nested JSON structure
INSERT INTO about_blocks (block_id, title, description, content, is_visible, sort_order) VALUES
('block1', 'Our Mission', 'Creating a living bridge between cultures, ideas, and artistic practices through exhibitions, residencies, and collaborative projects.', 'At Aether Art Space, our mission is to create a living bridge between cultures, ideas, and artistic practices. We champion painters and contemporary creators who explore form, materiality, and dialogue. Through exhibitions, residencies, and collaborative projects, we nurture meaningful encounters that challenge perception and invite new ways of seeing.', true, 1),
('block2', 'History', 'Founded in 2020, Aether Art Space has been a beacon for contemporary art, hosting over 50 exhibitions and featuring works from more than 200 artists.', 'Founded in 2020, Aether Art Space has been a beacon for contemporary art, hosting over 50 exhibitions and featuring works from more than 200 artists.

Founded in 2020, Aether Art Space has been a beacon for contemporary art, hosting over 50 exhibitions and featuring works from more than 200 artists.

Founded in 2020, Aether Art Space has been a beacon for contemporary art, hosting over 50 exhibitions and featuring works from more than 200 artists.

Founded in 2020, Aether Art Space has been a beacon for contemporary art, hosting over 50 exhibitions and featuring works from more than 200 artists.', false, 2),
('block3', 'Our Vision', 'We envision art as a shared language that transcends borders, fostering exchange between Greece and East Asia and beyond.', 'We envision art as a shared language that transcends borders. Guided by the ancient concept of aether—the subtle element beyond air—we aim to cultivate a space where the rarefied and the real coexist. By fostering exchange between Greece and East Asia and beyond, we aspire to be a global platform where art reveals deeper connections between people, places, and cultures.', true, 3);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_about_blocks_visible ON about_blocks(is_visible);
CREATE INDEX IF NOT EXISTS idx_about_blocks_sort_order ON about_blocks(sort_order);
CREATE INDEX IF NOT EXISTS idx_about_blocks_block_id ON about_blocks(block_id);
