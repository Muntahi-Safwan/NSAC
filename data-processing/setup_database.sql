-- PostgreSQL Setup Script for GEOS-CF Air Quality Database
-- Enables PostGIS and TimescaleDB extensions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Note: After running Prisma migrations, run the following to convert to hypertable:
-- SELECT create_hypertable('air_quality_forecasts', 'timestamp', if_not_exists => TRUE);

-- Create a PostGIS spatial index function for efficient nearest-neighbor queries
-- This will be used after Prisma creates the table

-- Optional: Create a materialized view for quick statistics
-- CREATE MATERIALIZED VIEW air_quality_stats AS
-- SELECT 
--     DATE_TRUNC('hour', timestamp) as hour,
--     AVG(pm25) as avg_pm25,
--     MIN(pm25) as min_pm25,
--     MAX(pm25) as max_pm25,
--     COUNT(*) as point_count
-- FROM air_quality_forecasts
-- GROUP BY DATE_TRUNC('hour', timestamp);

-- Create index on the materialized view
-- CREATE INDEX ON air_quality_stats (hour);

-- Function to refresh statistics (run periodically)
-- CREATE OR REPLACE FUNCTION refresh_air_quality_stats()
-- RETURNS void AS $$
-- BEGIN
--     REFRESH MATERIALIZED VIEW CONCURRENTLY air_quality_stats;
-- END;
-- $$ LANGUAGE plpgsql;

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';
COMMENT ON EXTENSION timescaledb IS 'TimescaleDB - scalable time-series data';

-- Print success message
DO $$
BEGIN
    RAISE NOTICE '✅ PostGIS and TimescaleDB extensions enabled successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Run: prisma generate';
    RAISE NOTICE '  2. Run: prisma db push';
    RAISE NOTICE '  3. Convert to hypertable: SELECT create_hypertable(''air_quality_forecasts'', ''timestamp'', if_not_exists => TRUE);';
END $$;

