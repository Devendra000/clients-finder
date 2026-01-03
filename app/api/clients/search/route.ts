import { type NextRequest, NextResponse } from "next/server"

// Mock database of clients
const MOCK_CLIENTS = [
  {
    id: "1",
    name: "Downtown Bistro",
    category: "Restaurant",
    address: "123 Main St, New York, NY",
    phone: "(555) 123-4567",
    email: "contact@downtonbistro.com",
    website: "www.downtonbistro.com",
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    id: "2",
    name: "TechHub Solutions",
    category: "Technology",
    address: "456 Silicon Ave, San Francisco, CA",
    phone: "(555) 234-5678",
    email: "info@techhub.com",
    website: "www.techhub.com",
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    id: "3",
    name: "Wellness Center",
    category: "Healthcare",
    address: "789 Health Rd, Austin, TX",
    phone: "(555) 345-6789",
    email: "help@wellness.com",
    website: "www.wellness.com",
    latitude: 30.2672,
    longitude: -97.7431,
  },
  {
    id: "4",
    name: "Fashion Forward Retail",
    category: "Retail",
    address: "321 Style Blvd, Los Angeles, CA",
    phone: "(555) 456-7890",
    email: "shop@fashionforward.com",
    website: "www.fashionforward.com",
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    id: "5",
    name: "Global Finance Inc",
    category: "Finance",
    address: "654 Banking St, Chicago, IL",
    phone: "(555) 567-8901",
    email: "contact@globalfinance.com",
    website: "www.globalfinance.com",
    latitude: 41.8781,
    longitude: -87.6298,
  },
]

export async function POST(request: NextRequest) {
  try {
    const { category, location } = await request.json()

    if (!location || location.trim().length === 0) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 })
    }

    // Filter clients based on category and location
    const filteredClients = MOCK_CLIENTS.filter((client) => {
      const categoryMatch = category === "All Categories" || client.category.toLowerCase() === category.toLowerCase()
      const locationMatch = client.address.toLowerCase().includes(location.toLowerCase())
      return categoryMatch && locationMatch
    })

    return NextResponse.json({
      clients: filteredClients,
      total: filteredClients.length,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to search clients" }, { status: 500 })
  }
}
