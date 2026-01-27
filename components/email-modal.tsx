"use client"

import { useState, useEffect } from "react"
import { X, Send, FileText } from "lucide-react"
import type { Client, EmailTemplate, TemplateTargetType } from "@/types/client"

interface EmailModalProps {
  client: Client
  isOpen: boolean
  onClose: () => void
}

export function EmailModal({ client, isOpen, onClose }: EmailModalProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen, client.hasWebsite])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      const data = await response.json()
      if (data.success) {
        // Filter templates based on client's website status
        const filtered = data.templates.filter((t: EmailTemplate) => {
          if (t.targetType === 'ALL') return true
          if (t.targetType === 'HAS_WEBSITE' && client.hasWebsite) return true
          if (t.targetType === 'NO_WEBSITE' && !client.hasWebsite) return true
          return false
        })
        setTemplates(filtered)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const applyTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    
    // Replace placeholders
    const replacedSubject = replacePlaceholders(template.subject)
    const replacedBody = replacePlaceholders(template.body)
    
    setSubject(replacedSubject)
    setBody(replacedBody)
  }

  const replacePlaceholders = (text: string): string => {
    return text
      .replace(/\{\{CLIENT_NAME\}\}/g, client.name)
      .replace(/\{\{CLIENT_ADDRESS\}\}/g, client.address)
      .replace(/\{\{CLIENT_EMAIL\}\}/g, client.email || '')
      .replace(/\{\{CLIENT_PHONE\}\}/g, client.phone || '')
      .replace(/\{\{CLIENT_WEBSITE\}\}/g, client.website || '')
      .replace(/\{\{CLIENT_CITY\}\}/g, client.city || '')
      .replace(/\{\{CLIENT_STATE\}\}/g, client.state || '')
  }

  const handleSend = () => {
    // Open default email client with pre-filled content
    const mailtoLink = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoLink
    onClose()
  }

  const handleReset = () => {
    setSelectedTemplate(null)
    setSubject('')
    setBody('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Send Email</h2>
            <p className="text-sm text-gray-600 mt-1">To: {client.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose a Template (Optional)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {templates.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No templates available. Create templates in the Templates section.
                </p>
              ) : (
                templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className={`text-left p-3 border-2 rounded-lg transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{template.name}</p>
                        <p className="text-xs text-gray-600 truncate">{template.subject}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter your message..."
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Reset
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!subject || !body || !client.email}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
