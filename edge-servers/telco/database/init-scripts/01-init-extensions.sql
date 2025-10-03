-- PostgreSQL Initialization Script for GEOS-CF Air Quality Database
-- This script runs automatically when the Docker container is first created
-- Enables PostGIS and TimescaleDB extensions

-- Connect to the database (already connected by default in init scripts)
\c air_quality_db

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Create a function for nearest-neighbor spatial queries
-- This will be useful for location-based air quality lookups
CREATE OR REPLACE FUNCTION get_nearest_air_quality(
    target_lat FLOAT,
    target_lon FLOAT,
    target_time TIMESTAMP
) 
RETURNS TABLE(
    id INT,
    timestamp TIMESTAMP,
    latitude FLOAT,
    longitude FLOAT,
    pm25 FLOAT,
    distance_km FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aqf.id,
        aqf.timestamp,
        aqf.latitude,
        aqf.longitude,
        aqf.pm25,
        ST_Distance(
            ST_MakePoint(aqf.longitude, aqf.latitude)::geography,
            ST_MakePoint(target_lon, target_lat)::geography
        ) / 1000 as distance_km
    FROM air_quality_forecasts aqf
    WHERE aqf.timestamp >= target_time - INTERVAL '1 hour'
      AND aqf.timestamp <= target_time + INTERVAL '1 hour'
    ORDER BY 
        ST_MakePoint(aqf.longitude, aqf.latitude) <-> 
        ST_MakePoint(target_lon, target_lat)
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Print success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Database initialized successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📦 Installed extensions:';
    RAISE NOTICE '  - PostGIS (spatial queries)';
    RAISE NOTICE '  - TimescaleDB (time-series optimization)';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next steps:';
    RAISE NOTICE '  1. Run: prisma generate';
    RAISE NOTICE '  2. Run: prisma db push';
    RAISE NOTICE '  3. Run: python main_pipeline.py';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;

