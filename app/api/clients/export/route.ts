import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ClientStatus } from "@/types/client"
import * as XLSX from "xlsx"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const city = searchParams.get("city")
    const hasWebsite = searchParams.get("hasWebsite")
    const hasPhone = searchParams.get("hasPhone")
    const hasEmail = searchParams.get("hasEmail")

    // Build where clause
    const where: any = {}
    
    if (status && status !== "all" && Object.values(ClientStatus).includes(status as ClientStatus)) {
      where.status = status
    }
    
    // Initialize AND array for multiple filters
    const andConditions: any[] = []
    
    // Filter by category
    if (category) {
      andConditions.push({
        category: {
          contains: category,
          mode: 'insensitive'
        }
      })
    }
    
    // Filter by city
    if (city) {
      andConditions.push({
        city: {
          contains: city,
          mode: 'insensitive'
        }
      })
    }
    
    // Filter by website presence
    if (hasWebsite === "false") {
      andConditions.push({
        OR: [
          { website: null },
          { website: "" },
        ]
      })
    } else if (hasWebsite === "true") {
      andConditions.push({
        website: { not: null }
      })
      andConditions.push({
        website: { not: "" }
      })
    }
    
    // Filter by phone presence
    if (hasPhone === "false") {
      andConditions.push({
        OR: [
          { phone: null },
          { phone: "" },
        ]
      })
    } else if (hasPhone === "true") {
      andConditions.push({
        phone: { not: null }
      })
      andConditions.push({
        phone: { not: "" }
      })
    }
    
    // Filter by email presence
    if (hasEmail === "false") {
      andConditions.push({
        OR: [
          { email: null },
          { email: "" },
        ]
      })
    } else if (hasEmail === "true") {
      andConditions.push({
        email: { not: null }
      })
      andConditions.push({
        email: { not: "" }
      })
    }
    
    if (andConditions.length > 0) {
      where.AND = andConditions
    }

    // Fetch all matching clients
    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Transform data for Excel
    const excelData = clients.map(client => ({
      'Name': client.name,
      'Category': client.category || '',
      'Status': client.status,
      'Address': client.address,
      'Street': client.street || '',
      'City': client.city || '',
      'State': client.state || '',
      'Postcode': client.postcode || '',
      'Country': client.country || '',
      'Phone': client.phone || '',
      'Email': client.email || '',
      'Website': client.website || '',
      'Latitude': client.latitude,
      'Longitude': client.longitude,
      'Data Source': client.datasource || '',
      'Created At': client.createdAt.toISOString(),
      'Updated At': client.updatedAt.toISOString(),
    }))

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Auto-size columns
    const maxWidth = 50
    const colWidths = Object.keys(excelData[0] || {}).map(key => {
      const maxLength = Math.max(
        key.length,
        ...excelData.map(row => String(row[key as keyof typeof row] || '').length)
      )
      return { wch: Math.min(maxLength + 2, maxWidth) }
    })
    worksheet['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients')

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Create filename with filters
    const filters = []
    if (category) filters.push(`category-${category}`)
    if (status && status !== "all") filters.push(`status-${status}`)
    if (city) filters.push(`city-${city}`)
    const filterStr = filters.length > 0 ? `_${filters.join('_')}` : ''
    const filename = `clients${filterStr}_${new Date().toISOString().split('T')[0]}.xlsx`

    // Return the Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to export clients",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
