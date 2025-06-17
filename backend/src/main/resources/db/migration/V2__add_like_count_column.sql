-- Ensure like_count column exists for existing installations
ALTER TABLE medical_articles ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0;
