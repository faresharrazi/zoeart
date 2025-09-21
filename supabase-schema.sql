-- Zωή Art Gallery Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create artists table
CREATE TABLE artists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL,
  education TEXT,
  exhibitions TEXT,
  profile_image TEXT,
  instagram VARCHAR(255),
  twitter VARCHAR(255),
  website VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artworks table
CREATE TABLE artworks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  medium VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  dimensions VARCHAR(100),
  technique TEXT,
  provenance TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exhibitions table
CREATE TABLE exhibitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('current', 'upcoming', 'past')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for exhibition-artwork relationships
CREATE TABLE exhibition_artworks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exhibition_id UUID REFERENCES exhibitions(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exhibition_id, artwork_id)
);

-- Create indexes for better performance
CREATE INDEX idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX idx_artworks_slug ON artworks(slug);
CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_artworks_year ON artworks(year);
CREATE INDEX idx_exhibitions_status ON exhibitions(status);
CREATE INDEX idx_exhibitions_dates ON exhibitions(start_date, end_date);
CREATE INDEX idx_exhibition_artworks_exhibition_id ON exhibition_artworks(exhibition_id);
CREATE INDEX idx_exhibition_artworks_artwork_id ON exhibition_artworks(artwork_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artworks_updated_at BEFORE UPDATE ON artworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exhibitions_updated_at BEFORE UPDATE ON exhibitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-images', 'gallery-images', true);

-- Set up Row Level Security (RLS)
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_artworks ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view artists" ON artists FOR SELECT USING (true);
CREATE POLICY "Public can view artworks" ON artworks FOR SELECT USING (true);
CREATE POLICY "Public can view exhibitions" ON exhibitions FOR SELECT USING (true);
CREATE POLICY "Public can view exhibition_artworks" ON exhibition_artworks FOR SELECT USING (true);

-- Create policies for admin full access (you'll need to set up authentication)
-- For now, we'll allow all operations - you can restrict this later
CREATE POLICY "Admin can manage artists" ON artists FOR ALL USING (true);
CREATE POLICY "Admin can manage artworks" ON artworks FOR ALL USING (true);
CREATE POLICY "Admin can manage exhibitions" ON exhibitions FOR ALL USING (true);
CREATE POLICY "Admin can manage exhibition_artworks" ON exhibition_artworks FOR ALL USING (true);

-- Insert sample data
INSERT INTO artists (name, specialty, bio, education, exhibitions, profile_image, instagram, twitter, website, email) VALUES
('Elena Rodriguez', 'Abstract Expressionism', 'Elena Rodriguez is a contemporary abstract artist whose work explores the intersection of emotion and movement. Born in Barcelona, she has exhibited internationally and is known for her dynamic use of color and form.', 'MFA Fine Arts, Barcelona Academy of Art', 'Solo: Gallery Modern (2023), Group: Contemporary Visions (2024)', null, 'https://instagram.com/elenarodriguezart', 'https://twitter.com/elenarodriguezart', 'https://elenarodriguezart.com', 'elena@elenarodriguezart.com'),
('Marcus Chen', 'Geometric Minimalism', 'Marcus Chen creates minimalist works that examine the relationship between structure and space. His precise geometric compositions have been featured in major galleries across Asia and Europe.', 'BFA Visual Arts, Central Saint Martins', 'Solo: White Cube London (2023), Venice Biennale (2024)', null, 'https://instagram.com/marcuschenart', null, 'https://marcuschenart.com', 'hello@marcuschenart.com'),
('Sarah Williams', 'Contemporary Portraiture', 'Sarah Williams is renowned for her deeply psychological portraits that capture the complexity of human emotion. Her work bridges traditional portraiture with contemporary artistic expression.', 'MFA Painting, Yale School of Art', 'Solo: Metropolitan Museum (2023), Whitney Biennial (2024)', null, 'https://instagram.com/sarahwilliamsart', 'https://twitter.com/sarahwilliamsart', 'https://sarahwilliamsportrait.com', 'sarah@sarahwilliamsportrait.com'),
('David Thompson', 'Abstract Landscape', 'David Thompson''s abstract landscapes celebrate the raw energy of natural forms. His bold brushwork and earth-tone palette create compositions that are both powerful and meditative.', 'BFA Landscape Painting, Rhode Island School of Design', 'Solo: National Gallery (2023), Group: Nature Reimagined (2024)', null, 'https://instagram.com/davidthompsonart', null, 'https://davidthompsonlandscapes.com', null),
('Luna Park', 'Contemporary Landscape', 'Luna Park reimagines traditional landscape painting for the contemporary world. Her stylized interpretations blend realism with modern artistic sensibilities.', 'MFA Contemporary Art, California Institute of the Arts', 'Solo: LACMA (2023), Group: New Landscapes (2024)', null, 'https://instagram.com/lunaparkart', 'https://twitter.com/lunaparkart', 'https://lunaparkart.com', 'luna@lunaparkart.com'),
('Alex Rivera', 'Sculptural Installation', 'Alex Rivera pushes the boundaries of sculptural art through innovative use of materials and space. Their installations challenge viewers'' perceptions through light, form, and transparency.', 'MFA Sculpture, Parsons School of Design', 'Solo: Guggenheim (2024), Group: Material Explorations (2024)', null, 'https://instagram.com/alexriverasculpture', null, 'https://alexriverasculpture.com', 'alex@alexriverasculpture.com');

-- Get artist IDs for artwork creation
DO $$
DECLARE
    elena_id UUID;
    marcus_id UUID;
    sarah_id UUID;
    david_id UUID;
    luna_id UUID;
    alex_id UUID;
BEGIN
    SELECT id INTO elena_id FROM artists WHERE name = 'Elena Rodriguez';
    SELECT id INTO marcus_id FROM artists WHERE name = 'Marcus Chen';
    SELECT id INTO sarah_id FROM artists WHERE name = 'Sarah Williams';
    SELECT id INTO david_id FROM artists WHERE name = 'David Thompson';
    SELECT id INTO luna_id FROM artists WHERE name = 'Luna Park';
    SELECT id INTO alex_id FROM artists WHERE name = 'Alex Rivera';

    -- Insert sample artworks
    INSERT INTO artworks (title, artist_id, year, medium, description, slug, status, dimensions, technique, provenance) VALUES
    ('Fluid Dynamics', elena_id, 2024, 'Acrylic on Canvas', 'An exploration of movement and form through organic shapes that dance across the canvas in harmonious blues and gold.', 'fluid-dynamics', 'available', '48 x 60 inches', 'Using traditional acrylic techniques combined with modern color theory, Rodriguez layered translucent glazes to achieve the luminous quality that defines this piece.', 'Created in the artist''s Barcelona studio, 2024'),
    ('Intersection', marcus_id, 2023, 'Mixed Media', 'A minimalist composition examining the relationship between structure and space in contemporary urban environments.', 'intersection', 'available', '36 x 36 inches', 'Combining traditional painting with digital precision, Chen uses laser-cut stencils and carefully mixed pigments to achieve perfect geometric harmony.', 'Completed in London studio, 2023'),
    ('Silent Contemplation', sarah_id, 2024, 'Oil on Canvas', 'A powerful portrait capturing the quiet strength and introspective nature of the human spirit.', 'silent-contemplation', 'available', '30 x 40 inches', 'Executed in classical oil painting techniques with contemporary psychological insights, using multiple glazing layers to achieve luminous skin tones.', 'Painted in New Haven studio, 2024'),
    ('Earth Rhythms', david_id, 2023, 'Acrylic on Canvas', 'Bold brushstrokes and earth tones create a dynamic composition celebrating the raw energy of nature.', 'earth-rhythms', 'available', '42 x 54 inches', 'Applied with palette knives and brushes in alla prima style, capturing the spontaneous energy of natural creation processes.', 'Created en plein air in Colorado, 2023'),
    ('Mountain Dreams', luna_id, 2024, 'Oil on Canvas', 'A contemporary interpretation of natural landscapes, blending realism with stylized forms and golden highlights.', 'mountain-dreams', 'available', '40 x 50 inches', 'Combining traditional oil painting methods with contemporary color relationships, achieving a balance between realism and stylization.', 'Inspired by Sierra Nevada landscapes, painted in studio 2024'),
    ('Modern Forms', alex_id, 2024, 'Steel & Glass Installation', 'An innovative sculptural piece that challenges perception through the interplay of light, metal, and transparency.', 'modern-forms', 'available', '72 x 48 x 24 inches', 'Fabricated using industrial materials and techniques, with custom-blown glass elements integrated into precision-cut steel framework.', 'Fabricated in Brooklyn metalworking studio, 2024');
END $$;

-- Insert sample exhibitions
INSERT INTO exhibitions (title, status, start_date, end_date, description, location) VALUES
('Contemporary Visions 2024', 'current', '2024-03-15', '2024-06-30', 'A comprehensive survey of contemporary art featuring works that challenge conventional perspectives and explore new visual languages. This exhibition brings together six exceptional artists whose diverse practices reflect the complexity of our modern world.', 'Main Gallery, Floors 1-2'),
('Material Explorations', 'upcoming', '2024-07-15', '2024-10-30', 'An innovative exhibition examining how contemporary artists push the boundaries of traditional materials. From steel and glass installations to mixed media compositions, explore how material choices shape artistic expression.', 'Sculpture Hall & Garden'),
('Intimate Reflections', 'upcoming', '2024-11-10', '2025-02-15', 'A focused exhibition of contemporary portraiture and personal narratives. These works invite viewers into moments of quiet contemplation and human connection, revealing the profound in the everyday.', 'Gallery 3'),
('Abstract Futures', 'past', '2023-09-20', '2023-12-15', 'A groundbreaking exhibition that explored the evolution of abstract art in the digital age. Featured works that bridge traditional abstract expressionism with contemporary digital influences and new media approaches.', 'Main Gallery, All Floors');
