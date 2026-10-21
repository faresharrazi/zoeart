-- Opening hours become a free list managed from the admin: each row has a
-- label ("Monday – Friday", "Holidays"...), the hours, a position and its own
-- "show on website" switch.
ALTER TABLE working_hours ALTER COLUMN day TYPE VARCHAR(60);
ALTER TABLE working_hours ALTER COLUMN time_frame TYPE VARCHAR(120);
ALTER TABLE working_hours ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
UPDATE working_hours w SET sort_order = r.n
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS n FROM working_hours) r
WHERE w.id = r.id;

-- At the client's request (October 2026) the address and opening hours are no
-- longer shown on the site. The hours are kept but hidden, so they can be
-- switched back on from the admin. The address was:
--   Mark. Mpotsari 7 Glyfada 16675
UPDATE working_hours SET is_active = FALSE;
UPDATE contact_info SET address = '';
