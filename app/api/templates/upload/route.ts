import { type NextRequest, NextResponse } from "next/server"

const STORAGE_API_URL = 'https://storage.devendrahamal.com.np/api/upload'
const STORAGE_BASE_URL = 'https://storage.devendrahamal.com.np'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: images, PDF, Word, Excel" },
        { status: 400 }
      )
    }

    // Prepare upload to external storage
    const uploadFormData = new FormData()
    uploadFormData.append('projectName', 'clients-finder-templates')
    uploadFormData.append('files', file)

    const apiKey = process.env.STORAGE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Storage API key not configured" },
        { status: 500 }
      )
    }

    const response = await fetch(STORAGE_API_URL, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey
      },
      body: uploadFormData
    })

    const result = await response.json()

    if (result.success && result.files && result.files.length > 0) {
      const uploadedFile = result.files[0]
      const fileUrl = uploadedFile.media_url 
        ? `${STORAGE_BASE_URL}${uploadedFile.media_url}`
        : `${STORAGE_BASE_URL}/api/images/clients-finder-templates/${uploadedFile.filename}`
      
      return NextResponse.json({
        success: true,
        url: fileUrl,
        filename: uploadedFile.originalFilename || uploadedFile.filename,
        size: uploadedFile.size,
        type: uploadedFile.mimetype
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
