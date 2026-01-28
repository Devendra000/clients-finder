import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params

    const emailHistory = await prisma.emailHistory.findMany({
      where: { clientId },
      orderBy: { sentAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      emailHistory,
    })
  } catch (error) {
    console.error('Error fetching email history:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch email history',
      },
      { status: 500 }
    )
  }
}
