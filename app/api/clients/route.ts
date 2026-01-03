import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ClientStatus } from "@/types/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const city = searchParams.get("city")
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")

    // Build where clause
    const where: any = {}
    
    if (status && Object.values(ClientStatus).includes(status as ClientStatus)) {
      where.status = status
    }
    
    if (category) {
      where.category = {
        contains: category,
        mode: 'insensitive'
      }
    }
    
    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive'
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
