import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const direction = searchParams.get("direction") // 'next' or 'prev'

    // Get filter parameters
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const hasWebsite = searchParams.get("hasWebsite")
    const hasPhone = searchParams.get("hasPhone")
    const hasEmail = searchParams.get("hasEmail")

    // Build filter conditions
    const filterConditions: Prisma.ClientWhereInput = {}

    if (category && category !== "all") {
      filterConditions.category = category
    }

    if (status && status !== "all") {
      filterConditions.status = status.toUpperCase() as any
    }

    if (hasWebsite === "true") {
      filterConditions.website = { not: null }
    } else if (hasWebsite === "false") {
      filterConditions.website = null
    }

    if (hasPhone === "true") {
      filterConditions.phone = { not: null }
    } else if (hasPhone === "false") {
      filterConditions.phone = null
    }

    if (hasEmail === "true") {
      filterConditions.email = { not: null }
    } else if (hasEmail === "false") {
      filterConditions.email = null
    }

    // Get current client's creation date for ordering
    const currentClient = await prisma.client.findUnique({
      where: { id },
      select: { createdAt: true }
    })

    if (!currentClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    let nextClient = null

    if (direction === "next") {
      // Get the next client (newer/after current) with filters
      nextClient = await prisma.client.findFirst({
        where: {
          ...filterConditions,
          createdAt: {
            gt: currentClient.createdAt
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        select: { id: true }
      })

      // If no next client, get the first one with filters (loop back)
      if (!nextClient) {
        nextClient = await prisma.client.findFirst({
          where: filterConditions,
          orderBy: {
            createdAt: 'asc'
          },
          select: { id: true }
        })
      }
    } else if (direction === "prev") {
      // Get the previous client (older/before current) with filters
      nextClient = await prisma.client.findFirst({
        where: {
          ...filterConditions,
          createdAt: {
            lt: currentClient.createdAt
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: { id: true }
      })

      // If no previous client, get the last one with filters (loop back)
      if (!nextClient) {
        nextClient = await prisma.client.findFirst({
          where: filterConditions,
          orderBy: {
            createdAt: 'desc'
          },
          select: { id: true }
        })
      }
    }

    return NextResponse.json({ clientId: nextClient?.id || null })
  } catch (error) {
    console.error("Error fetching navigation:", error)
    return NextResponse.json(
      { error: "Failed to fetch navigation" },
      { status: 500 }
    )
  }
}
