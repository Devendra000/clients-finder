require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const prismaPgAdapter = new PrismaPg(pool)

const prisma = new PrismaClient({ 
  adapter: prismaPgAdapter,
  log: ['error'],
})

async function main() {
  const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL || "dev20581114@gmail.com"

  if (!testEmail) {
    console.log('NEXT_PUBLIC_TEST_EMAIL environment variable not set. Skipping test client creation.')
    return
  }

  // Check if test client already exists
  const existingTestClient = await prisma.client.findUnique({
    where: { placeId: 'test-client' },
  })

  if (existingTestClient) {
    console.log('Test client already exists.')
    return
  }

  // Create test client
  const testClient = await prisma.client.create({
    data: {
      placeId: 'test-client',
      name: 'Test Client',
      category: 'Testing',
      address: '123 Test Street',
      city: 'Test City',
      state: 'TS',
      postcode: '12345',
      country: 'Test Country',
      email: testEmail,
      phone: '+1-555-0000',
      website: 'https://test.example.com',
      latitude: 0,
      longitude: 0,
      status: 'PENDING',
      openingHours: '9:00 AM - 5:00 PM',
      facilities: 'Testing Facility',
      datasource: 'Manual Test Entry',
    },
  })

  console.log(`Test client created with email: ${testEmail}`)
  console.log('Client ID:', testClient.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
