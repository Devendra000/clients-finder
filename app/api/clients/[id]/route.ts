import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ClientStatus } from "@/types/client"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    // Validate status
    if (!status || !Object.values(ClientStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: PENDING, LEAD, REJECTED, CONTACTED, CLOSED" },
        { status: 400 }
      )
    }

    // Update client status
    const updatedClient = await prisma.client.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({
      success: true,
      client: updatedClient,
    })

  } catch (error) {
    console.error("Error updating client status:", error)
    
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update client status" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const client = await prisma.client.findUnique({
      where: { id },
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      client,
    })

  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch client" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.client.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
    })

  } catch (error) {
    console.error("Error deleting client:", error)
    
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete client" },
      { status: 500 }
    )
  }
}
