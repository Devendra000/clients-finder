import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { TemplateTargetType } from "@/types/client"

// GET single template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      template
    })
  } catch (error) {
    console.error("Error fetching template:", error)
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    )
  }
}

// PATCH update template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, subject, body: templateBody, targetType } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (subject !== undefined) updateData.subject = subject
    if (templateBody !== undefined) updateData.body = templateBody
    if (targetType !== undefined) {
      if (!Object.values(TemplateTargetType).includes(targetType)) {
        return NextResponse.json(
          { error: "Invalid targetType" },
          { status: 400 }
        )
      }
      updateData.targetType = targetType
    }

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      template
    })
  } catch (error) {
    console.error("Error updating template:", error)
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    )
  }
}

// DELETE template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.emailTemplate.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting template:", error)
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    )
  }
}
