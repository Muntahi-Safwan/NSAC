const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('📊 Database Statistics:\n');

  const forecastCount = await prisma.airQualityForecast.count();
  console.log(`   Air Quality Forecasts: ${forecastCount.toLocaleString()}`);

  const realtimeCount = await prisma.airQualityRealtime.count();
  console.log(`   Air Quality Realtime:  ${realtimeCount.toLocaleString()}`);

  const fireCount = await prisma.fireDetections.count();
  console.log(`   Fire Detections:       ${fireCount.toLocaleString()}`);

  const heatwaveCount = await prisma.heatwaveAlerts.count();
  console.log(`   Heatwave Alerts:       ${heatwaveCount.toLocaleString()}`);

  console.log(`\n   Total Records:         ${(forecastCount + realtimeCount + fireCount + heatwaveCount).toLocaleString()}`);

  // Get date ranges
  const oldestForecast = await prisma.airQualityForecast.findFirst({
    orderBy: { timestamp: 'asc' },
    select: { timestamp: true },
  });

  const newestForecast = await prisma.airQualityForecast.findFirst({
    orderBy: { timestamp: 'desc' },
    select: { timestamp: true },
  });

  console.log(`\n📅 Date Ranges:`);
  console.log(`   Forecasts: ${oldestForecast?.timestamp} to ${newestForecast?.timestamp}`);
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
