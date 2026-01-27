import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    const { to, subject, body, clientId, clientName, clientEmail, useBrevo } = await request.json()

    // Validate required fields
    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      )
    }

    // Use Brevo if requested and configured
    if (useBrevo && process.env.BREVO_API_KEY) {
      const result = await sendViaBrevo(to, subject, body, clientName, clientEmail)
      // Update client status if email sent successfully and clientId provided
      if (result.ok && clientId) {
        await updateClientStatus(clientId)
      }
      return result
    }

    // Otherwise use SMTP (nodemailer)
    const result = await sendViaSMTP(to, subject, body, clientName, clientEmail)
    // Update client status if email sent successfully and clientId provided
    if (result.ok && clientId) {
      await updateClientStatus(clientId)
    }
    return result
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send test email',
      },
      { status: 500 }
    )
  }
}

async function updateClientStatus(clientId: string) {
  try {
    // Get current client status
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { status: true }
    })

    // Only update if status is PENDING
    if (client?.status === 'PENDING') {
      await prisma.client.update({
        where: { id: clientId },
        data: { status: 'CONTACTED' }
      })
    }
  } catch (error) {
    console.error('Error updating client status:', error)
    // Don't throw - email was sent successfully, just status update failed
  }
}

async function sendViaSMTP(
  to: string,
  subject: string,
  body: string,
  clientName: string,
  clientEmail: string
) {
  try {
    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html: body,
    })

    return NextResponse.json({
      success: true,
      message: 'Test email sent via SMTP successfully',
      messageId: info.messageId,
      method: 'SMTP',
    })
  } catch (error) {
    throw error
  }
}

async function sendViaBrevo(
  to: string,
  subject: string,
  body: string,
  clientName: string,
  clientEmail: string
) {
  try {
    const brevoApiKey = process.env.BREVO_API_KEY
    if (!brevoApiKey) {
      throw new Error('Brevo API key not configured')
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL
    const senderName = process.env.BREVO_SENDER_NAME

    if (!senderEmail) {
      throw new Error('Brevo sender email not configured (set BREVO_SENDER_EMAIL)')
    }

    const htmlContent = `
      <html>
        <body>
          <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; word-wrap: break-word;">
${body}
          </pre>
        </body>
      </html>
    `

    // Use Brevo Transactional Email API
    const emailPayload = {
      sender: {
        email: senderEmail,
        name: senderName || 'Clients Finder',
      },
      to: [
        {
          email: to,
          name: clientName || 'Recipient',
        },
      ],
      subject: subject,
      htmlContent: htmlContent,
      replyTo: {
        email: clientEmail || senderEmail,
      },
    }

    const sendResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
        'accept': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    if (!sendResponse.ok) {
      const error = await sendResponse.json()
      throw new Error(`Brevo API error: ${JSON.stringify(error)}`)
    }

    const result = await sendResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Test email sent via Brevo successfully',
      messageId: result.messageId,
      method: 'Brevo',
    })
  } catch (error) {
    console.error('Brevo API error:', error)
    throw error
  }
}
