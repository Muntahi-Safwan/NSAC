const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking available coordinates in database...\n');

  // Get distinct locations from forecasts
  const locations = await prisma.airQualityForecast.findMany({
    distinct: ['latitude', 'longitude'],
    select: {
      latitude: true,
      longitude: true,
    },
    take: 10,
  });

  console.log('Sample coordinates in database:');
  locations.forEach((loc, index) => {
    console.log(`   ${index + 1}. Lat: ${loc.latitude}, Lng: ${loc.longitude}`);
  });

  // Check for New York area
  const nyArea = await prisma.airQualityForecast.findFirst({
    where: {
      latitude: {
        gte: 40,
        lte: 41,
      },
      longitude: {
        gte: -75,
        lte: -73,
      },
    },
    select: {
      latitude: true,
      longitude: true,
      timestamp: true,
    },
  });

  console.log('\n🗽 New York area data:');
  if (nyArea) {
    console.log(`   Found: Lat: ${nyArea.latitude}, Lng: ${nyArea.longitude}`);
    console.log(`   Timestamp: ${nyArea.timestamp}`);
  } else {
    console.log('   ❌ No data found in New York area');
  }

  // Get latitude/longitude ranges
  const ranges = await prisma.$queryRaw`
    SELECT
      MIN(latitude) as min_lat,
      MAX(latitude) as max_lat,
      MIN(longitude) as min_lng,
      MAX(longitude) as max_lng
    FROM air_quality_forecasts
    LIMIT 1
  `;

  console.log('\n📊 Coordinate ranges in database:');
  console.log(`   Latitude:  ${ranges[0].min_lat} to ${ranges[0].max_lat}`);
  console.log(`   Longitude: ${ranges[0].min_lng} to ${ranges[0].max_lng}`);
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
