-- SQL queries to view air quality data
-- Run these commands in PostgreSQL

-- 1. Basic table information
SELECT 
    COUNT(*) as total_records,
    MIN(timestamp) as oldest_record,
    MAX(timestamp) as newest_record
FROM air_quality_forecasts;

-- 2. Sample data (first 10 records)
SELECT 
    id,
    timestamp,
    latitude,
    longitude,
    pm25,
    no2,
    o3,
    so2,
    co,
    hcho
FROM air_quality_forecasts 
ORDER BY id 
LIMIT 10;

-- 3. Data for a specific location (New York City area)
SELECT 
    id,
    timestamp,
    latitude,
    longitude,
    pm25,
    no2,
    o3,
    so2,
    co
FROM air_quality_forecasts 
WHERE 
    latitude BETWEEN 40.2 AND 41.2 
    AND longitude BETWEEN -74.5 AND -73.5
ORDER BY timestamp DESC
LIMIT 5;

-- 4. Statistics by pollutant
SELECT 
    'PM2.5' as pollutant,
    MIN(pm25) as min_value,
    MAX(pm25) as max_value,
    AVG(pm25) as avg_value,
    COUNT(pm25) as count
FROM air_quality_forecasts 
WHERE pm25 IS NOT NULL

UNION ALL

SELECT 
    'NO2' as pollutant,
    MIN(no2) as min_value,
    MAX(no2) as max_value,
    AVG(no2) as avg_value,
    COUNT(no2) as count
FROM air_quality_forecasts 
WHERE no2 IS NOT NULL

UNION ALL

SELECT 
    'O3' as pollutant,
    MIN(o3) as min_value,
    MAX(o3) as max_value,
    AVG(o3) as avg_value,
    COUNT(o3) as count
FROM air_quality_forecasts 
WHERE o3 IS NOT NULL

UNION ALL

SELECT 
    'SO2' as pollutant,
    MIN(so2) as min_value,
    MAX(so2) as max_value,
    AVG(so2) as avg_value,
    COUNT(so2) as count
FROM air_quality_forecasts 
WHERE so2 IS NOT NULL

UNION ALL

SELECT 
    'CO' as pollutant,
    MIN(co) as min_value,
    MAX(co) as max_value,
    AVG(co) as avg_value,
    COUNT(co) as count
FROM air_quality_forecasts 
WHERE co IS NOT NULL;

-- 5. Data by geographic region (sample)
SELECT 
    CASE 
        WHEN latitude BETWEEN 15 AND 30 THEN 'South'
        WHEN latitude BETWEEN 30 AND 45 THEN 'Central'
        WHEN latitude BETWEEN 45 AND 60 THEN 'North'
    END as region,
    COUNT(*) as record_count,
    AVG(pm25) as avg_pm25,
    AVG(no2) as avg_no2,
    AVG(o3) as avg_o3
FROM air_quality_forecasts 
WHERE latitude IS NOT NULL
GROUP BY 
    CASE 
        WHEN latitude BETWEEN 15 AND 30 THEN 'South'
        WHEN latitude BETWEEN 30 AND 45 THEN 'Central'
        WHEN latitude BETWEEN 45 AND 60 THEN 'North'
    END
ORDER BY region;

