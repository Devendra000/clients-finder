import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ClientStatus } from "@/types/client"

const CATEGORIES = [
  "education.school",
  "catering.restaurant",
  "healthcare.hospital",
  "healthcare.pharmacy",
  "commercial.supermarket",
  "service.beauty",
  "entertainment.cinema",
  "accommodation.hotel",
  "commercial.shopping_mall",
  "sport.fitness",
]

// Nepal center coordinates (Kathmandu)
const NEPAL_CENTER = {
  lat: 27.7172,
  lon: 85.3240
}

interface FetchStats {
  category: string
  totalFetched: number
  newClients: number
  existingClients: number
  completed: boolean
}

async function fetchBatchFromGeoapify(
  category: string,
  lat: number,
  lon: number,
  radius: string,
  limit: number,
  offset: number
) {
  if (!process.env.GEOAPIFY_API_KEY) {
    throw new Error("Geoapify API key not configured")
  }

  const geoapifyUrl = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},${radius}&limit=${limit}&offset=${offset}&apiKey=${process.env.GEOAPIFY_API_KEY}`

  const response = await fetch(geoapifyUrl)
  
  if (!response.ok) {
    throw new Error(`Geoapify API error: ${response.status}`)
  }

  return await response.json()
}

async function storePlaces(features: any[], category: string) {
  const results = await Promise.allSettled(
    features.map(async (feature: any) => {
      const properties = feature.properties
      
      if (!properties.place_id) {
        return null
      }

      const existingClient = await prisma.client.findUnique({
        where: { placeId: properties.place_id }
      })

      if (existingClient) {
        return { existing: true, client: existingClient }
      }

      const newClient = await prisma.client.create({
        data: {
          placeId: properties.place_id,
          name: properties.name || properties.address_line1 || "Unknown",
          category: properties.categories?.join('; ') || category || null,
          address: properties.formatted || properties.address_line1 || "Unknown",
          street: properties.street || properties.address_line1 || null,
          city: properties.city || null,
          state: properties.state || null,
          postcode: properties.postcode || null,
          country: properties.country || null,
          countryCode: properties.country_code || null,
          phone: properties.contact?.phone || properties.datasource?.raw?.phone || null,
          email: properties.contact?.email || properties.datasource?.raw?.email || null,
          website: properties.contact?.website || properties.datasource?.raw?.website || null,
          latitude: properties.lat,
          longitude: properties.lon,
          status: ClientStatus.PENDING,
          openingHours: properties.opening_hours ? JSON.stringify(properties.opening_hours) : null,
          facilities: properties.facilities ? JSON.stringify(properties.facilities) : null,
          datasource: properties.datasource?.sourcename || null,
        }
      })

      return { existing: false, client: newClient }
    })
  )

  const clients = results
    .filter((result) => result.status === "fulfilled" && result.value !== null)
    .map((result: any) => result.value)

  const newCount = clients.filter((c: any) => !c.existing).length
  const existingCount = clients.filter((c: any) => c.existing).length

  return { newCount, existingCount, total: clients.length }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      lat = NEPAL_CENTER.lat, 
      lon = NEPAL_CENTER.lon, 
      radius = "50000", // 50km radius
      batchSize = 100,
      maxBatchesPerCategory = 10, // Max 1000 results per category
      category = null // Optional: fetch specific category only
    } = body

    const stats: FetchStats[] = []
    let grandTotal = 0
    let grandNew = 0

    // Determine which categories to fetch
    const categoriesToFetch = category ? [category] : CATEGORIES

    console.log(`🚀 Starting auto-fetch for Nepal (${lat}, ${lon}) with ${radius}m radius`)
    console.log(`📋 Categories: ${categoriesToFetch.join(', ')}`)

    for (const cat of categoriesToFetch) {
      console.log(`\n📍 Fetching category: ${cat}`)
      
      let categoryTotal = 0
      let categoryNew = 0
      let categoryExisting = 0
      let offset = 0
      let hasMore = true
      let batchCount = 0

      while (hasMore && batchCount < maxBatchesPerCategory) {
        try {
          const data = await fetchBatchFromGeoapify(
            cat,
            lat,
            lon,
            radius,
            batchSize,
            offset
          )

          if (!data.features || data.features.length === 0) {
            hasMore = false
            break
          }

          const { newCount, existingCount, total } = await storePlaces(data.features, cat)
          
          categoryTotal += total
          categoryNew += newCount
          categoryExisting += existingCount
          grandTotal += total
          grandNew += newCount

          console.log(`  Batch ${batchCount + 1}: ${newCount} new, ${existingCount} existing`)

          offset += batchSize
          batchCount++
          hasMore = data.features.length === batchSize

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (error) {
          console.error(`  Error in batch ${batchCount + 1}:`, error)
          hasMore = false
        }
      }

      stats.push({
        category: cat,
        totalFetched: categoryTotal,
        newClients: categoryNew,
        existingClients: categoryExisting,
        completed: !hasMore || batchCount >= maxBatchesPerCategory
      })

      console.log(`✓ ${cat}: ${categoryNew} new clients (${categoryTotal} total fetched)`)
    }

    console.log(`\n✅ Auto-fetch completed: ${grandNew} new clients from ${grandTotal} total fetched`)

    return NextResponse.json({
      success: true,
      stats,
      summary: {
        totalFetched: grandTotal,
        newClients: grandNew,
        existingClients: grandTotal - grandNew,
        categoriesProcessed: categoriesToFetch.length
      }
    })

  } catch (error) {
    console.error("Auto-fetch error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Auto-fetch failed",
      },
      { status: 500 }
    )
  }
}
