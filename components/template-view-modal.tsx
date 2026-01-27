"use client"

import { X, Paperclip, Download } from 'lucide-react'
import type { EmailTemplate } from '@/types/client'
import { useState } from 'react'
import { MediaLightbox } from './media-lightbox'

interface TemplateViewModalProps {
  isOpen: boolean
  template: EmailTemplate | null
  onClose: () => void
  targetTypeLabels: Record<string, string>
}

export function TemplateViewModal({ isOpen, template, onClose, targetTypeLabels }: TemplateViewModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; fileName: string } | null>(null)

  if (!isOpen || !template) return null

  const getFileNameFromUrl = (url: string) => {
    return url.split('/').pop() || url
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Target Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Type</label>
              <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                {targetTypeLabels[template.targetType] || 'Unknown'}
              </span>
            </div>

            {/* Email Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Email Content</label>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                {/* Email Header */}
                <div className="bg-white px-4 py-3 border-b border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">TO: client@example.com</div>
                  <div className="text-sm font-semibold text-gray-900">Subject: {template.subject}</div>
                </div>

                {/* Email Body */}
                <div className="p-4 text-sm text-gray-700">
                  {template.body ? (
                    <div
                      className="email-preview"
                      dangerouslySetInnerHTML={{ __html: template.body }}
                      style={{
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#333'
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 italic">No content</div>
                  )}
                  <style>{`
                    .email-preview * {
                      max-width: 100%;
                    }
                    .email-preview div {
                      margin: 8px 0;
                    }
                    .email-preview br {
                      display: block;
                      content: "";
                      height: 8px;
                    }
                    .email-preview strong, .email-preview b {
                      font-weight: bold;
                    }
                    .email-preview em, .email-preview i {
                      font-style: italic;
                    }
                    .email-preview u {
                      text-decoration: underline;
                    }
                    .email-preview h1, .email-preview h2, .email-preview h3,
                    .email-preview h4, .email-preview h5, .email-preview h6 {
                      margin: 12px 0 8px 0;
                      font-weight: bold;
                    }
                    .email-preview ul, .email-preview ol {
                      margin: 8px 0 8px 20px;
                    }
                    .email-preview li {
                      margin: 4px 0;
                    }
                    .email-preview a {
                      color: #2563eb;
                      text-decoration: underline;
                    }
                  `}</style>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {template.attachments && template.attachments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Attachments ({template.attachments.length})</label>
                <div className="flex flex-wrap gap-4">
                  {template.attachments.map((url, index) => {
                    const fileName = getFileNameFromUrl(url)
                    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
                    const isPdf = /\.pdf$/i.test(url)

                    return (
                      <div key={index} className="flex flex-col items-center gap-2">
                        {isImage ? (
                          <div
                            className="relative group cursor-pointer"
                            onClick={() => {
                              setSelectedMedia({ url, fileName })
                              setLightboxOpen(true)
                            }}
                          >
                            <img
                              src={url}
                              alt={fileName}
                              className="h-32 w-32 object-cover rounded-lg border border-gray-300 group-hover:opacity-75 transition-opacity shadow-sm"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                              <span className="text-white text-xs font-medium bg-black bg-opacity-70 px-2 py-1 rounded">View Full</span>
                            </div>
                          </div>
                        ) : isPdf ? (
                          <div
                            className="relative group cursor-pointer"
                            onClick={() => {
                              setSelectedMedia({ url, fileName })
                              setLightboxOpen(true)
                            }}
                          >
                            <div className="h-32 w-32 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border border-gray-300 flex flex-col items-center justify-center group-hover:opacity-75 transition-opacity shadow-sm">
                              <div className="text-4xl font-bold text-red-600 mb-1">PDF</div>
                              <div className="text-xs text-gray-600 text-center px-2 line-clamp-2">{fileName}</div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                              <span className="text-white text-xs font-medium bg-black bg-opacity-70 px-2 py-1 rounded">View</span>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="relative group cursor-pointer"
                            onClick={() => {
                              setSelectedMedia({ url, fileName })
                              setLightboxOpen(true)
                            }}
                          >
                            <div className="h-32 w-32 bg-gray-100 rounded-lg border border-gray-300 flex flex-col items-center justify-center group-hover:opacity-75 transition-opacity shadow-sm cursor-pointer">
                              <Paperclip className="h-8 w-8 text-gray-400 mb-2" />
                              <div className="text-xs text-gray-600 text-center px-2 line-clamp-2">{fileName}</div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                              <span className="text-white text-xs font-medium bg-black bg-opacity-70 px-2 py-1 rounded">Open</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
              <div>Created: {template.createdAt ? new Date(template.createdAt).toLocaleString() : 'N/A'}</div>
              {template.updatedAt && (
                <div>Updated: {new Date(template.updatedAt).toLocaleString()}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MediaLightbox
        isOpen={lightboxOpen}
        mediaUrl={selectedMedia?.url || ''}
        fileName={selectedMedia?.fileName}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
