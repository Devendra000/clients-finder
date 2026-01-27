"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Save, X, Upload, Paperclip, XCircle, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import type { EmailTemplate, TemplateTargetType, CustomTargetType, AlertType } from "@/types/client"
import { TargetTypeModal } from "./target-type-modal"
import { TemplateViewModal } from "./template-view-modal"
import { AlertDialog } from "./alert-dialog"

export function TemplateManager() {
  const router = useRouter()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [customTargets, setCustomTargets] = useState<CustomTargetType[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isTargetTypeModalOpen, setIsTargetTypeModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [viewingTemplate, setViewingTemplate] = useState<EmailTemplate | null>(null)

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
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to load templates'
      })
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

  // Filter and paginate templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [templates, searchQuery])

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage)
  const paginatedTemplates = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage
    return filteredTemplates.slice(startIdx, startIdx + itemsPerPage)
  }, [filteredTemplates, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

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
      <TemplateViewModal
        isOpen={viewingTemplate !== null}
        template={viewingTemplate}
        onClose={() => setViewingTemplate(null)}
        targetTypeLabels={targetTypeLabels}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
            <button
              onClick={() => router.push('/templates/create')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Template
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates by name or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {paginatedTemplates.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredTemplates.length)} of {filteredTemplates.length} templates
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              {templates.length === 0 ? (
                <>
                  <p className="text-lg font-medium mb-2">No templates yet</p>
                  <p>Create your first template to get started!</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">No results found</p>
                  <p>Try adjusting your search query</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedTemplates.map((template) => (
                  <div key={template.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{template.name}</h3>
                      <p className="text-sm text-gray-600 truncate mt-1">{template.subject}</p>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1">
                      <div className="space-y-3">
                        {/* Target Type Badge */}
                        <div>
                          <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            {targetTypeLabels[template.targetType] || 'Unknown'}
                          </span>
                        </div>

                        {/* Attachments Count */}
                        {template.attachments && template.attachments.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Paperclip className="h-4 w-4" />
                            <span>{template.attachments.length} attachment{template.attachments.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}

                        {/* Created Date */}
                        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                          Created: {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer - Action Buttons */}
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex gap-2">
                      <button
                        onClick={() => setViewingTemplate(template)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
                        title="View template"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => startEdit(template)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                        title="Edit template"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors text-sm font-medium"
                        title="Delete template"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
