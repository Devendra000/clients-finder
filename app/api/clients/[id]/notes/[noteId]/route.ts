import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PATCH update a note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { noteId } = await params
    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      )
    }

    const note = await prisma.note.update({
      where: { id: noteId },
      data: { content: content.trim() }
    })

    return NextResponse.json({
      success: true,
      note
    })
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    )
  }
}

// DELETE a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { noteId } = await params

    await prisma.note.delete({
      where: { id: noteId }
    })

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    )
  }
}
