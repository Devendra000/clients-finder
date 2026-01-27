import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all custom target types
export async function GET(request: NextRequest) {
  try {
    const customTargets = await prisma.customTargetType.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      customTargets
    })
  } catch (error) {
    console.error("Error fetching custom target types:", error)
    return NextResponse.json(
      { error: "Failed to fetch custom target types" },
      { status: 500 }
    )
  }
}

// POST create new custom target type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      )
    }

    const customTargetType = await prisma.customTargetType.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || "#3B82F6"
      }
    })

    return NextResponse.json({
      success: true,
      customTargetType
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating custom target type:", error)
    return NextResponse.json(
      { error: "Failed to create custom target type" },
      { status: 500 }
    )
  }
}
