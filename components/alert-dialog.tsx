"use client"

import { useEffect } from 'react'
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

interface AlertDialogProps {
  isOpen: boolean
  type: AlertType
  title: string
  message: string
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
}

export function AlertDialog({
  isOpen,
  type,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel'
}: AlertDialogProps) {
  useEffect(() => {
    if (isOpen && !onConfirm) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onConfirm, onClose])

  if (!isOpen) return null

  const iconMap = {
    success: <CheckCircle className="h-6 w-6 text-green-600" />,
    error: <XCircle className="h-6 w-6 text-red-600" />,
    warning: <AlertCircle className="h-6 w-6 text-yellow-600" />,
    info: <Info className="h-6 w-6 text-blue-600" />
  }

  const bgColorMap = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  }

  const titleColorMap = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900'
  }

  const messageColorMap = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-yellow-700',
    info: 'text-blue-700'
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/10 to-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-lg max-w-md w-full mx-4 border ${bgColorMap[type]}`}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">{iconMap[type]}</div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${titleColorMap[type]}`}>
                {title}
              </h3>
              <p className={`mt-2 text-sm ${messageColorMap[type]}`}>
                {message}
              </p>
            </div>
          </div>

          {onConfirm && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                  type === 'success'
                    ? 'bg-green-600 hover:bg-green-700'
                    : type === 'error'
                    ? 'bg-red-600 hover:bg-red-700'
                    : type === 'warning'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmText}
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {cancelText}
              </button>
            </div>
          )}

          {!onConfirm && (
            <button
              onClick={onClose}
              className={`w-full mt-4 px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                type === 'success'
                  ? 'bg-green-600 hover:bg-green-700'
                  : type === 'error'
                  ? 'bg-red-600 hover:bg-red-700'
                  : type === 'warning'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
