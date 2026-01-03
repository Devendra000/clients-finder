import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ClientStatus } from "@/types/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const city = searchParams.get("city")
    const search = searchParams.get("search") // New general search parameter
    const hasWebsite = searchParams.get("hasWebsite") // Filter by website presence
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")

    // Build where clause
    const where: any = {}
    
    if (status && Object.values(ClientStatus).includes(status as ClientStatus)) {
      where.status = status
    }
    
    // Filter by website presence
    if (hasWebsite === "false") {
      where.OR = [
        { website: null },
        { website: "" },
      ]
    } else if (hasWebsite === "true") {
      where.AND = where.AND || []
      where.AND.push({
        website: {
          not: null,
        },
      })
      where.AND.push({
        website: {
          not: "",
        },
      })
    }
    
    // Fuzzy search across multiple fields
    if (search && search.trim()) {
      // Split search query into individual words for fuzzy matching
      const searchWords = search.trim().split(/\s+/).filter(word => word.length > 0)
      
      // Create OR conditions for each word across all searchable fields
      const wordConditions = searchWords.map(word => ({
        OR: [
          { name: { contains: word, mode: 'insensitive' } },
          { category: { contains: word, mode: 'insensitive' } },
          { address: { contains: word, mode: 'insensitive' } },
          { city: { contains: word, mode: 'insensitive' } },
          { state: { contains: word, mode: 'insensitive' } },
          { phone: { contains: word, mode: 'insensitive' } },
          { email: { contains: word, mode: 'insensitive' } },
          { website: { contains: word, mode: 'insensitive' } },
        ]
      }))
      
      // All words must match (AND logic) - at least one field per word
      where.AND = wordConditions
    } else {
      // Original filters if no general search
      if (category && category !== "All Categories") {
        where.category = {
          contains: category,
          mode: 'insensitive'
        }
      }
      
      if (city && city.trim()) {
        where.city = {
          contains: city,
          mode: 'insensitive'
        }
      }
    }

    // Get clients from database
    const clients = await prisma.client.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
    })

    // Get total count
    const total = await prisma.client.count({ where })

    return NextResponse.json({
      success: true,
      total,
      clients,
    })

  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch clients" },
      { status: 500 }
    )
  }
}
