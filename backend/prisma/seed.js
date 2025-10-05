const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const prisma = new PrismaClient();

// Helper function to parse CSV file
function parseCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    cast: true,
    cast_date: false,
  });
}

// Helper function to convert string to number or null
function toNumber(value) {
  if (value === null || value === undefined || value === '' || value === 'NULL') {
    return null;
  }
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

// Helper function to convert string to date
function toDate(value) {
  if (!value || value === 'NULL') return null;
  return new Date(value);
}

// Helper function to convert boolean
function toBoolean(value) {
  if (value === 'True' || value === 'true' || value === true) return true;
  if (value === 'False' || value === 'false' || value === false) return false;
  return false;
}

async function seedAirQualityForecasts() {
  console.log('🌍 Seeding Air Quality Forecasts...');
  const csvPath = path.join(__dirname, '../../data-processing/data/air_quality_forecasts.csv');

  if (!fs.existsSync(csvPath)) {
    console.log('⚠️  Air quality forecasts CSV not found, skipping...');
    return;
  }

  const records = parseCSV(csvPath);
  console.log(`   Found ${records.length} forecast records`);

  // Delete existing data
  await prisma.airQualityForecast.deleteMany({});
  console.log('   Cleared existing forecasts');

  // Insert in batches of 1000
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const data = batch.map((record) => ({
      timestamp: toDate(record.timestamp),
      forecastInitTime: toDate(record.forecastInitTime),
      latitude: toNumber(record.latitude),
      longitude: toNumber(record.longitude),
      level: toNumber(record.level),
      pm25: toNumber(record.pm25),
      no2: toNumber(record.no2),
      o3: toNumber(record.o3),
      so2: toNumber(record.so2),
      co: toNumber(record.co),
      hcho: toNumber(record.hcho),
      aqi: toNumber(record.aqi),
      source: record.source || 'GEOS-CF-FORECAST',
    }));

    await prisma.airQualityForecast.createMany({ data });
    console.log(`   Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);
  }

  console.log(`✅ Seeded ${records.length} air quality forecasts\n`);
}

async function seedAirQualityRealtime() {
  console.log('🌡️  Seeding Air Quality Realtime...');
  const csvPath = path.join(__dirname, '../../data-processing/data/air_quality_realtime.csv');

  if (!fs.existsSync(csvPath)) {
    console.log('⚠️  Air quality realtime CSV not found, skipping...');
    return;
  }

  const records = parseCSV(csvPath);
  console.log(`   Found ${records.length} realtime records`);

  // Delete existing data
  await prisma.airQualityRealtime.deleteMany({});
  console.log('   Cleared existing realtime data');

  // Insert in batches of 1000
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const data = batch.map((record) => ({
      timestamp: toDate(record.timestamp),
      latitude: toNumber(record.latitude),
      longitude: toNumber(record.longitude),
      level: toNumber(record.level) || 0,
      pm25: toNumber(record.pm25),
      no2: toNumber(record.no2),
      o3: toNumber(record.o3),
      so2: toNumber(record.so2),
      co: toNumber(record.co),
      hcho: toNumber(record.hcho),
      aqi: toNumber(record.aqi),
      source: record.source || 'GEOS-CF-ANALYSIS',
    }));

    await prisma.airQualityRealtime.createMany({ data, skipDuplicates: true });
    console.log(`   Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);
  }

  console.log(`✅ Seeded ${records.length} air quality realtime records\n`);
}

async function seedFireDetections() {
  console.log('🔥 Seeding Fire Detections...');
  const csvPath = path.join(__dirname, '../../data-processing/data/fire_detections.csv');

  if (!fs.existsSync(csvPath)) {
    console.log('⚠️  Fire detections CSV not found, skipping...');
    return;
  }

  const records = parseCSV(csvPath);
  console.log(`   Found ${records.length} fire detection records`);

  // Delete existing data
  await prisma.fireDetections.deleteMany({});
  console.log('   Cleared existing fire detections');

  // Insert in batches of 1000
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const data = batch.map((record) => ({
      latitude: toNumber(record.latitude),
      longitude: toNumber(record.longitude),
      brightness: toNumber(record.brightness),
      scan: toNumber(record.scan),
      track: toNumber(record.track),
      brightT31: toNumber(record.brightT31),
      frp: toNumber(record.frp),
      acqDate: toDate(record.acqDate),
      acqTime: String(record.acqTime || '0000').padStart(4, '0'),
      daynight: String(record.daynight || 'N'),
      satellite: String(record.satellite || 'N'),
      confidence: String(record.confidence || 'n'),
      version: String(record.version || '2.0NRT'),
      alertLevel: parseInt(record.alertLevel) || 0,
      alertSent: toBoolean(record.alertSent),
      source: String(record.source || 'NASA-FIRMS'),
    }));

    await prisma.fireDetections.createMany({ data, skipDuplicates: true });
    console.log(`   Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);
  }

  console.log(`✅ Seeded ${records.length} fire detections\n`);
}

async function seedHeatwaveAlerts() {
  console.log('🌡️  Seeding Heatwave Alerts...');
  const csvPath = path.join(__dirname, '../../data-processing/data/heatwave_alerts.csv');

  if (!fs.existsSync(csvPath)) {
    console.log('⚠️  Heatwave alerts CSV not found, skipping...');
    return;
  }

  const records = parseCSV(csvPath);
  console.log(`   Found ${records.length} heatwave alert records`);

  // Delete existing data
  await prisma.heatwaveAlerts.deleteMany({});
  console.log('   Cleared existing heatwave alerts');

  // Insert in batches of 1000
  const batchSize = 1000;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const data = batch.map((record) => ({
      latitude: toNumber(record.latitude),
      longitude: toNumber(record.longitude),
      alertDate: toDate(record.alertDate),
      forecastInitTime: toDate(record.forecastInitTime),
      maxTemperature: toNumber(record.maxTemperature),
      minTemperature: toNumber(record.minTemperature),
      maxHeatIndex: toNumber(record.maxHeatIndex),
      alertLevel: parseInt(record.alertLevel) || 0,
      alertMessage: record.alertMessage || null,
      source: record.source || 'GEOS-CF',
    }));

    await prisma.heatwaveAlerts.createMany({ data, skipDuplicates: true });
    console.log(`   Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);
  }

  console.log(`✅ Seeded ${records.length} heatwave alerts\n`);
}

async function main() {
  console.log('🚀 Starting database seed...\n');
  console.log('=' .repeat(60));

  try {
    await seedAirQualityForecasts();
    await seedAirQualityRealtime();
    await seedFireDetections();
    await seedHeatwaveAlerts();

    console.log('=' .repeat(60));
    console.log('✅ Database seeding completed successfully!');
    console.log('=' .repeat(60));
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
