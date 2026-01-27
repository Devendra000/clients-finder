import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const S3_ENDPOINT = process.env.S3_ENDPOINT || 'https://storage.devendrahamal.com.np'
const S3_BUCKET = process.env.S3_BUCKET || 'chakra-clients'
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || ''
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || ''
const S3_REGION = process.env.S3_REGION || 'cn-east-1'

function generateAWS4Signature(
  method: string,
  path: string,
  payload: Buffer,
  contentType: string,
  date: string
): {
  signature: string
  payloadHash: string
  date: string
  dateStamp: string
  signedHeaders: string
  credentialScope: string
} {
  const endpoint = new URL(S3_ENDPOINT)
  const host = endpoint.host
  const timestamp = date
  const dateStamp = timestamp.slice(0, 8)
  
  // Calculate payload hash
  const payloadHash = crypto
    .createHash('sha256')
    .update(payload)
    .digest('hex')
  
  // Canonical request
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${timestamp}\n`
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'
  const canonicalRequest = `${method}\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`
  
  // String to sign
  const algorithm = 'AWS4-HMAC-SHA256'
  const credentialScope = `${dateStamp}/${S3_REGION}/s3/aws4_request`
  const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${canonicalRequestHash}`
  
  // Signing key
  const kDate = crypto.createHmac('sha256', `AWS4${S3_SECRET_KEY}`).update(dateStamp).digest()
  const kRegion = crypto.createHmac('sha256', kDate).update(S3_REGION).digest()
  const kService = crypto.createHmac('sha256', kRegion).update('s3').digest()
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest()
  
  // Signature
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex')
  
  return {
    signature,
    payloadHash,
    date: timestamp,
    dateStamp,
    signedHeaders,
    credentialScope
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 10MB" },
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
        { success: false, error: "Invalid file type. Only JPEG, PNG, WebP, GIF, PDF, Word, and Excel are allowed." },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${sanitizedName}`
    
    // Get file buffer
    const buffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(buffer)

    // Generate AWS4 signature
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
    const objectPath = `/${S3_BUCKET}/${filename}`
    
    const signatureData = generateAWS4Signature(
      'PUT',
      objectPath,
      fileBuffer,
      file.type,
      amzDate
    )

    // Build authorization header
    const s3AuthHeader = `AWS4-HMAC-SHA256 Credential=${S3_ACCESS_KEY}/${signatureData.credentialScope}, SignedHeaders=${signatureData.signedHeaders}, Signature=${signatureData.signature}`

    // Upload to S3
    const uploadUrl = `${S3_ENDPOINT}${objectPath}`
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'x-amz-content-sha256': signatureData.payloadHash,
        'x-amz-date': signatureData.date,
        'Authorization': s3AuthHeader
      },
      body: fileBuffer
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('S3 upload error:', uploadResponse.status, errorText)
      return NextResponse.json(
        { success: false, error: `S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}` },
        { status: 500 }
      )
    }

    // S3 returns empty response on success, construct URL directly
    const fileUrl = `${S3_ENDPOINT}${objectPath}`
    
    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        filename: file.name,
        size: file.size,
        type: file.type
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}