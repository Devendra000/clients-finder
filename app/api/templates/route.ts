import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { TemplateTargetType } from "@/types/client"

// GET all templates
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const targetType = searchParams.get("targetType")

    const where = targetType ? { targetType: targetType as any } : {}

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      templates
    })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    )
  }
}

// POST create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, subject, body: templateBody, targetType } = body

    // Validate required fields
    if (!name || !subject || !templateBody || !targetType) {
      return NextResponse.json(
        { error: "Missing required fields: name, subject, body, targetType" },
        { status: 400 }
      )
    }

    // Validate targetType
    if (!Object.values(TemplateTargetType).includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid targetType. Must be: ALL, HAS_WEBSITE, or NO_WEBSITE" },
        { status: 400 }
      )
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body: templateBody,
        targetType
      }
    })

    return NextResponse.json({
      success: true,
      template
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    )
  }
}
