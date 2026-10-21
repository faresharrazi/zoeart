-- Footer partner logos, managed from the admin panel
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    logo_url VARCHAR(500) NOT NULL,
    website_url VARCHAR(500),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- The five logos the footer showed until now (files in public/collaborators)
INSERT INTO partners (name, logo_url, sort_order)
SELECT name, logo_url, sort_order
FROM (VALUES
    ('Collaborating organisation', '/collaborators/1.webp', 1),
    ('Vermillion Neo', '/collaborators/2.webp', 2),
    ('Aegean Times International Media', '/collaborators/3.webp', 3),
    ('Sino-Hellenic Performing Arts Alliance', '/collaborators/4.webp', 4),
    ('Sino-Hellenic International Theatre Festival', '/collaborators/5.webp', 5)
) AS v(name, logo_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM partners);

-- Cookie-free visit statistics. No IP addresses are stored: visitor_id is a
-- hash with a random salt that changes every day (analytics_salts), so a
-- visitor can't be followed from one day to the next.
CREATE TABLE IF NOT EXISTS page_views (
    id BIGSERIAL PRIMARY KEY,
    path VARCHAR(300) NOT NULL,
    referrer_host VARCHAR(200),
    utm_source VARCHAR(100),
    visitor_id CHAR(16) NOT NULL,
    device VARCHAR(10) NOT NULL,
    country CHAR(2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path, created_at);

CREATE TABLE IF NOT EXISTS analytics_salts (
    day DATE PRIMARY KEY,
    salt VARCHAR(64) NOT NULL
);

-- Older admin versions saved whole page objects inside page_content.content,
-- nesting a little deeper on every save
UPDATE page_content SET content = '{}' WHERE content ? 'page_name';
