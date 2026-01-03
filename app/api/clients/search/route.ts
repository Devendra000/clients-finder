import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ClientStatus } from "@/types/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")
    const category = searchParams.get("category")
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")
    const radius = searchParams.get("radius") || "5000" // Default 5km radius
    const limit = searchParams.get("limit") || "20"

    if (!process.env.GEOAPIFY_API_KEY) {
      return NextResponse.json(
        { error: "Geoapify API key not configured" },
        { status: 500 }
      )
    }

    // Build Geoapify Places API URL
    const baseUrl = "https://api.geoapify.com/v2/places"
    const params = new URLSearchParams({
      apiKey: process.env.GEOAPIFY_API_KEY,
      limit: limit,
    })

    // Add search parameters
    if (query) {
      params.append("text", query)
    }
    if (category) {
      params.append("categories", category)
    }
    if (lat && lon) {
      params.append("filter", `circle:${lon},${lat},${radius}`)
      params.append("bias", `proximity:${lon},${lat}`)
    }

    const geoapifyUrl = `${baseUrl}?${params.toString()}`

    // Fetch from Geoapify
    const response = await fetch(geoapifyUrl)
    
    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Transform and store places in database
    const clients = await Promise.all(
      data.features.map(async (feature: any) => {
        const properties = feature.properties
        
        // Check if client already exists by place_id
        const existingClient = await prisma.client.findUnique({
          where: { placeId: properties.place_id }
        })

        if (existingClient) {
          return existingClient
        }

        // Create new client
        const newClient = await prisma.client.create({
          data: {
            placeId: properties.place_id,
            name: properties.name || properties.address_line1 || "Unknown",
            category: properties.categories?.[0] || null,
            address: properties.formatted || properties.address_line1,
            street: properties.street || null,
            city: properties.city || null,
            state: properties.state || null,
            postcode: properties.postcode || null,
            country: properties.country || null,
            countryCode: properties.country_code || null,
            phone: properties.datasource?.raw?.phone || null,
            email: properties.datasource?.raw?.email || null,
            website: properties.datasource?.raw?.website || null,
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

    return NextResponse.json({
      success: true,
      count: clients.length,
      clients: clients,
    })

  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to search places" },
      { status: 500 }
    )
  }
}
