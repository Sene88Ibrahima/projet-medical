-- Add like_count column to medical_articles and create article_shares table
ALTER TABLE medical_articles ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS article_shares (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES medical_articles(id) ON DELETE CASCADE,
    from_doctor_id BIGINT NOT NULL,
    to_doctor_id BIGINT NOT NULL,
    shared_at TIMESTAMP NOT NULL
);
