-- PostgreSQL Initialization Script for NSAC Database
-- This script runs automatically when the Docker container is first created
-- Using standard PostgreSQL features only (no extensions)

-- Connect to the database (already connected by default in init scripts)
-- Database name comes from POSTGRES_DB environment variable

-- Print success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ NSAC Database initialized successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📦 Features available:';
    RAISE NOTICE '  - Standard PostgreSQL 16';
    RAISE NOTICE '  - UUID generation (uuid())';
    RAISE NOTICE '  - JSONB support';
    RAISE NOTICE '  - Full-text search';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next steps:';
    RAISE NOTICE '  1. Run: prisma generate';
    RAISE NOTICE '  2. Run: prisma db push';
    RAISE NOTICE '  3. Start your application containers';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;

