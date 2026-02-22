import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ClientStatus } from "@/types/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")
    const radius = searchParams.get("radius") || "10000"
    const limit = searchParams.get("limit") || "50"
    const offset = searchParams.get("offset") || "0"

    if (!process.env.GEOAPIFY_API_KEY) {
      return NextResponse.json(
        { error: "Geoapify API key not configured" },
        { status: 500 }
      )
    }

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      )
    }

    // Build Geoapify Places API URL with offset for pagination
    const geoapifyUrl = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},${radius}&limit=${limit}&offset=${offset}&apiKey=${process.env.GEOAPIFY_API_KEY}`

    console.log(`Fetching from Geoapify (offset: ${offset}):`, geoapifyUrl.replace(process.env.GEOAPIFY_API_KEY, "***"))

    // Fetch from Geoapify
    const response = await fetch(geoapifyUrl)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Geoapify API error:", response.status, errorText)
      throw new Error(`Geoapify API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.features || !Array.isArray(data.features)) {
      console.log("No features in response:", data)
      return NextResponse.json({
        success: true,
        count: 0,
        clients: [],
        message: "No places found for the given criteria"
      })
    }

    console.log(`Found ${data.features.length} places from Geoapify`)

    // Transform and store places in database
    const results = await Promise.allSettled(
      data.features.map(async (feature: any) => {
        const properties = feature.properties
        
        if (!properties.place_id) {
          console.warn("Skipping place without place_id:", properties)
          return null
        }

        // Check if client already exists by place_id
        const existingClient = await prisma.client.findUnique({
          where: { placeId: properties.place_id }
        })

        if (existingClient) {
          console.log(`Client already exists: ${properties.name}`)
          return existingClient
        }

        // Create new client
        console.log(`Creating new client: ${properties.name || properties.address_line1}`)
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

        return newClient
      })
    )

    // Filter out nulls and failed promises
    const clients = results
      .filter((result) => result.status === "fulfilled" && result.value !== null)
      .map((result: any) => result.value)

    const newCount = clients.filter((c: any) => 
      results.find((r: any) => r.status === "fulfilled" && r.value?.id === c.id && r.value?.createdAt.getTime() > Date.now() - 5000)
    ).length

    console.log(`Stored ${clients.length} clients (${newCount} new, ${clients.length - newCount} existing)`)

    const hasMore = data.features.length === parseInt(limit)
    const nextOffset = parseInt(offset) + parseInt(limit)

    return NextResponse.json({
      success: true,
      count: clients.length,
      newCount,
      existingCount: clients.length - newCount,
      clients: clients,
      pagination: {
        offset: parseInt(offset),
        limit: parseInt(limit),
        hasMore,
        nextOffset: hasMore ? nextOffset : null,
      },
    })

  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to search places",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
