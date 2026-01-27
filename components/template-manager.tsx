"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Save, X, Upload, Paperclip, XCircle } from "lucide-react"
import type { EmailTemplate, TemplateTargetType, CustomTargetType, AlertType } from "@/types/client"
import { TargetTypeModal } from "./target-type-modal"
import { AlertDialog } from "./alert-dialog"

export function TemplateManager() {
  const router = useRouter()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [customTargets, setCustomTargets] = useState<CustomTargetType[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isTargetTypeModalOpen, setIsTargetTypeModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    targetType: 'ALL' as TemplateTargetType,
    attachments: [] as string[]
  })

  const [uploadingFile, setUploadingFile] = useState(false)
  const [alert, setAlert] = useState<{
    isOpen: boolean
    type: AlertType
    title: string
    message: string
    onConfirm?: () => void
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  })
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    templateId?: string
  }>({
    isOpen: false
  })

  useEffect(() => {
    loadTemplates()
    loadCustomTargets()
  }, [])

  const loadCustomTargets = async () => {
    try {
      const response = await fetch('/api/target-types')
      const data = await response.json()
      if (data.success) {
        setCustomTargets(data.customTargets || [])
      }
    } catch (error) {
      console.error('Error loading custom targets:', error)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      const data = await response.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTargetTypeCreated = (newType: CustomTargetType) => {
    setCustomTargets(prev => [...prev, newType])
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadTemplates()
        resetForm()
        setIsCreating(false)
      } else {
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to create template'
        })
      }
    } catch (error) {
      console.error('Error creating template:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Error creating template'
      })
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadTemplates()
        resetForm()
        setEditingId(null)
      } else {
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to update template'
        })
      }
    } catch (error) {
      console.error('Error updating template:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Error updating template'
      })
    }
  }

  const handleDelete = async (templateId: string) => {
    setDeleteConfirm({
      isOpen: true,
      templateId
    })
  }

  const confirmDelete = async (templateId: string) => {
    setDeleteConfirm({ isOpen: false })
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadTemplates()
      } else {
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to delete template'
        })
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Error deleting template'
      })
    }
  }

  const startEdit = (template: EmailTemplate) => {
    router.push(`/templates/${template.id}/edit`)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      targetType: 'ALL' as TemplateTargetType,
      attachments: []
    })
    setIsCreating(false)
    setEditingId(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
        },
        body: uploadFormData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      if (data.success) {
        setFormData({
          ...formData,
          attachments: [...formData.attachments, data.data.url]
        })
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to upload file'
      })
    } finally {
      setUploadingFile(false)
      e.target.value = '' // Reset input
    }
  }

  const removeAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index)
    })
  }

  const getFileNameFromUrl = (url: string) => {
    return url.split('/').pop() || url
  }

  const targetTypeLabels = {
    ALL: 'All Clients',
    HAS_WEBSITE: 'Clients with Website',
    NO_WEBSITE: 'Clients without Website',
    CUSTOM: 'Custom Target'
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading templates...</div>
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <AlertDialog
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert(prev => ({ ...prev, isOpen: false }))}
        onConfirm={alert.onConfirm}
      />
      <AlertDialog
        isOpen={deleteConfirm.isOpen}
        type="warning"
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        onClose={() => setDeleteConfirm({ isOpen: false })}
        onConfirm={() => deleteConfirm.templateId && confirmDelete(deleteConfirm.templateId)}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <TargetTypeModal 
        isOpen={isTargetTypeModalOpen}
        onClose={() => setIsTargetTypeModalOpen(false)}
        onSuccess={handleTargetTypeCreated}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
            <button
              onClick={() => router.push('/templates/create')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Template
            </button>
          </div>

          {/* Templates List */}
          <div className="space-y-4">
            {templates.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No templates yet. Create your first template to get started!
              </div>
            ) : (
              templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded mt-1">
                    {targetTypeLabels[template.targetType] || 'Unknown'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(template)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit template"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Subject:</span>
                  <p className="text-gray-600 mt-1">{template.subject}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Body:</span>
                  <p className="text-gray-600 mt-1 whitespace-pre-wrap font-mono text-xs bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                    {template.body}
                  </p>
                </div>
                {template.attachments && template.attachments.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Attachments:</span>
                    <div className="mt-2 space-y-1">
                      {template.attachments.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <Paperclip className="h-3 w-3" />
                          {getFileNameFromUrl(url)}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
