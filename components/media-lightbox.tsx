"use client"

import { X } from 'lucide-react'
import { useState } from 'react'

interface MediaLightboxProps {
  isOpen: boolean
  mediaUrl: string
  fileName?: string
  onClose: () => void
}

export function MediaLightbox({ isOpen, mediaUrl, fileName, onClose }: MediaLightboxProps) {
  const [imageError, setImageError] = useState(false)

  if (!isOpen) return null

  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(mediaUrl)
  const isPdf = /\.pdf$/i.test(mediaUrl)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100]">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white hover:bg-gray-200 rounded-full transition-colors z-10"
        title="Close"
      >
        <X className="h-6 w-6 text-black" />
      </button>

      {/* Content */}
      <div className="max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
        {isImage ? (
          imageError ? (
            <div className="text-white text-center">
              <p className="text-xl mb-4">Unable to load image</p>
              <p className="text-gray-300">{fileName}</p>
            </div>
          ) : (
            <img
              src={mediaUrl}
              alt={fileName || 'Media preview'}
              onError={() => setImageError(true)}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          )
        ) : isPdf ? (
          <iframe
            src={mediaUrl}
            title={fileName || 'PDF preview'}
            className="w-full h-[90vh] rounded-lg"
          />
        ) : (
          <div className="text-white text-center">
            <p className="text-xl mb-4">Preview not available</p>
            <p className="text-gray-300 mb-6">{fileName}</p>
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
