-- Update post_type enum to include more categories
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'politics';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'tech';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'entertainment';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'world';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'opinion';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'sports';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'business';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'lifestyle';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'health';