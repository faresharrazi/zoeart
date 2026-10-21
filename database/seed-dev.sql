-- Sample content for local development only. Never run this against
-- production. Images are Cloudinary's public demo assets.

TRUNCATE articles, exhibitions, artworks, artists, hero_images, about_blocks RESTART IDENTITY CASCADE;

INSERT INTO artists (name, slug, bio, specialty, profile_image, social_media, assigned_artworks, is_visible) VALUES
('Eleni Markou', 'eleni-markou', 'Athens-based painter working with layered pigment and light.', 'Painting',
 'https://res.cloudinary.com/demo/image/upload/samples/people/smiling-man.jpg', '{"instagram": "elenimarkou", "website": "https://example.com"}', '["1","2"]', TRUE),
('Kenji Sato', 'kenji-sato', 'Sculptor exploring form and void.', 'Sculpture',
 'https://res.cloudinary.com/demo/image/upload/samples/people/boy-snow-hoodie.jpg', '{"instagram": "kenjisato"}', '["3"]', TRUE),
('Hidden Artist', 'hidden-artist', 'Not yet announced.', 'Mixed media', '', '{}', '["4"]', FALSE);

INSERT INTO artworks (title, slug, artist_id, year, medium, size, description, images, featured_image, is_visible) VALUES
('Urban Light', 'urban-light', 1, 2024, 'Oil on canvas', '100 x 80 cm', 'A study of evening light.',
 '["https://res.cloudinary.com/demo/image/upload/samples/landscapes/girl-urban-view.jpg", "https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg"]',
 'https://res.cloudinary.com/demo/image/upload/samples/landscapes/girl-urban-view.jpg', TRUE),
('Shoreline', 'shoreline', 1, 2023, 'Acrylic on linen', '60 x 60 cm', 'Boats at rest.',
 '["https://res.cloudinary.com/demo/image/upload/samples/landscapes/beach-boat.jpg"]',
 'https://res.cloudinary.com/demo/image/upload/samples/landscapes/beach-boat.jpg', TRUE),
('Signs', 'signs', 2, 2022, 'Bronze', '40 x 20 x 20 cm', 'Cast bronze.',
 '["https://res.cloudinary.com/demo/image/upload/samples/landscapes/architecture-signs.jpg"]',
 'https://res.cloudinary.com/demo/image/upload/samples/landscapes/architecture-signs.jpg', TRUE),
('Unreleased Work', 'unreleased-work', 3, 2025, 'Mixed media', '', 'Should not appear publicly.',
 '["https://res.cloudinary.com/demo/image/upload/samples/sheep.jpg"]',
 'https://res.cloudinary.com/demo/image/upload/samples/sheep.jpg', FALSE);

INSERT INTO exhibitions (title, slug, description, start_date, end_date, location, curator, status, featured_image, gallery_images, assigned_artists, assigned_artworks, call_for_artists, cta_link, press_media_name, press_media_link, is_visible) VALUES
('Aether Now', 'aether-now', 'Our current group show.', CURRENT_DATE - 10, CURRENT_DATE + 30, 'Glyfada', 'Zoe', 'current',
 'https://res.cloudinary.com/demo/image/upload/cld-sample.jpg',
 '["https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg", "https://res.cloudinary.com/demo/image/upload/cld-sample-4.jpg", "https://res.cloudinary.com/demo/image/upload/cld-sample-5.jpg"]',
 '["1","2"]', '["1","3"]', FALSE, '', 'Press release', 'https://example.com/press.pdf', TRUE),
('Mountains', 'mountains', 'Upcoming solo show.', CURRENT_DATE + 40, CURRENT_DATE + 80, 'Glyfada', 'Zoe', 'upcoming',
 'https://res.cloudinary.com/demo/image/upload/samples/landscapes/nature-mountains.jpg', '[]', '["2"]', '[]', TRUE, 'https://example.com/apply', '', '', TRUE),
('Earlier Show', 'earlier-show', 'A past exhibition.', CURRENT_DATE - 200, CURRENT_DATE - 150, 'Glyfada', '', 'past',
 'https://res.cloudinary.com/demo/image/upload/sample.jpg', '[]', '["1"]', '["2"]', FALSE, '', '', '', TRUE),
('Draft Exhibition', 'draft-exhibition', 'Hidden draft.', CURRENT_DATE + 100, CURRENT_DATE + 120, '', '', 'upcoming',
 '', '[]', '[]', '[]', FALSE, '', '', '', FALSE);

INSERT INTO articles (exhibition_id, title, content, author, is_published, published_at) VALUES
(1, 'About Aether Now', '<p>An essay on the show.</p>', 'Zoe', TRUE, NOW()),
(2, 'Draft essay', '<p>Not published yet.</p>', 'Zoe', FALSE, NULL);

INSERT INTO hero_images (cloudinary_url, cloudinary_public_id, original_name, display_order, is_active) VALUES
('https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg', 'cld-sample-2', 'hero-1.jpg', 0, TRUE),
('https://res.cloudinary.com/demo/image/upload/samples/landscapes/nature-mountains.jpg', 'samples/landscapes/nature-mountains', 'hero-2.jpg', 1, TRUE);

INSERT INTO about_blocks (block_id, title, content, is_visible, sort_order) VALUES
('block1', 'Our Mission', '<p>Creating a living bridge between cultures.</p>', TRUE, 1),
('block2', 'History', '<p>Hidden block.</p>', FALSE, 2),
('block3', 'Our Vision', '<p>Art as a shared language.</p>', TRUE, 3);

UPDATE contact_info SET email = 'info@example.com', phone = '+30 210 000 0000', instagram = 'aetherartspace', address = 'Glyfada, Athens, Greece';

INSERT INTO newsletter_subscribers (email, name) VALUES
('reader@example.com', 'Reader'),
('=cmd()@example.com', '=HYPERLINK("http://evil.example","click")')
ON CONFLICT (email) DO NOTHING;
