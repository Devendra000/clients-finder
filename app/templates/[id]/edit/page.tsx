"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Save, X, Upload, Paperclip, XCircle } from 'lucide-react'
import { TargetTypeModal } from '@/components/target-type-modal'
import { AlertDialog, type AlertType } from '@/components/alert-dialog'
import type { EmailTemplate, TemplateTargetType, CustomTargetType } from "@/types/client"

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [customTargets, setCustomTargets] = useState<CustomTargetType[]>([])
  const [isTargetTypeModalOpen, setIsTargetTypeModalOpen] = useState(false)
  
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
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    targetType: 'ALL' as TemplateTargetType,
    customTargetId: '',
    attachments: [] as string[]
  })

  const [currentView] = useState<"clients" | "fetch" | "templates">("templates")

  const handleViewChange = (view: "clients" | "fetch" | "templates") => {
    if (view === "clients") {
      router.push("/")
    } else if (view === "fetch") {
      router.push("/?view=fetch")
    } else {
      router.push("/templates")
    }
  }

  useEffect(() => {
    loadTemplate()
    loadCustomTargets()
  }, [templateId])

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

  const handleTargetTypeCreated = (newType: CustomTargetType) => {
    setCustomTargets(prev => [...prev, newType])
  }
  const loadTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}`)
      const data = await response.json()
      if (data.success && data.template) {
        setFormData({
          name: data.template.name,
          subject: data.template.subject,
          body: data.template.body,
          targetType: data.template.targetType || 'ALL',
          customTargetId: data.template.customTargetId || '',
          attachments: data.template.attachments || []
        })
      } else {
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Template not found',
          onConfirm: () => router.push('/templates')
        })
      }
    } catch (error) {
      console.error('Error loading template:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Error loading template',
        onConfirm: () => router.push('/templates')
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    setUploadingFile(true)
    const formDataToSend = new FormData()
    formDataToSend.append('file', files[0])

    try {
      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, data.url]
        }))
      } else {
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Upload Failed',
          message: 'Failed to upload file'
        })
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Upload Error',
        message: 'Error uploading file'
      })
    } finally {
      setUploadingFile(false)
    }
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
      setAlert({
        isOpen: true,
        type: 'warning',
        title: 'Missing Fields',
        message: 'Please fill in all required fields (Name, Subject, Body)'
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setAlert({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'Template updated successfully',
          onConfirm: () => router.push('/templates')
        })
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
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          currentView={currentView}
          onViewChange={handleViewChange}
        />
        <div className="flex-1 flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AlertDialog
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert(prev => ({ ...prev, isOpen: false }))}
        onConfirm={alert.onConfirm}
      />
      <TargetTypeModal 
        isOpen={isTargetTypeModalOpen}
        onClose={() => setIsTargetTypeModalOpen(false)}
        onSuccess={handleTargetTypeCreated}
      />
      <Sidebar 
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Template</h1>
          <button
            onClick={() => router.push('/templates')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            {/* Template Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Welcome Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Target Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Type
              </label>
              <select
                name="targetType"
                value={formData.targetType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Clients</option>
                <option value="HAS_WEBSITE">Clients with Website</option>
                <option value="NO_WEBSITE">Clients without Website</option>
                {customTargets.length > 0 && (
                  <>
                    <optgroup label="Custom">
                      {customTargets.map(target => (
                        <option key={target.id} value={`CUSTOM_${target.id}`}>
                          {target.name}
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}
              </select>
              {customTargets.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  <button
                    type="button"
                    onClick={() => setIsTargetTypeModalOpen(true)}
                    className="text-blue-600 hover:underline"
                  >
                    Create custom target types
                  </button>
                </p>
              )}
            </div>

            {/* Email Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Email subject line"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Email Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Body *
              </label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleInputChange}
                placeholder="Email content"
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Attachments
              </label>

              {formData.attachments.length > 0 && (
                <div className="mb-4 space-y-2">
                  {formData.attachments.map((attachment, index) => {
                    const fileName = attachment.split('/').pop() || attachment
                    return (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {fileName}
                        </span>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  )
                  })}
                </div>
              )}

              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition">
                <div className="flex items-center gap-2 text-gray-600">
                  <Upload size={20} />
                  <span className="text-sm">
                    {uploadingFile ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </span>
                </div>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                />
              </label>
            </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                >
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save Template'}
                </button>
                <button
                  onClick={() => router.push('/templates')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <div className="sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Email Header */}
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">TO: client@example.com</div>
                  <div className="text-sm font-semibold text-gray-900">Subject: {formData.subject || '(Empty)'}</div>
                </div>

                {/* Email Body */}
                <div className="p-6 text-sm text-gray-700 leading-relaxed">
                  {formData.body ? (
                    <div className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-4 rounded border border-gray-200">
                      {formData.body}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic">Email body will appear here...</div>
                  )}
                </div>

                {/* Attachments Preview */}
                {formData.attachments.length > 0 && (
                  <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="text-xs font-medium text-gray-700 mb-2">Attachments ({formData.attachments.length})</div>
                    <div className="space-y-1">
                      {formData.attachments.map((attachment, index) => {
                        const fileName = attachment.split('/').pop() || attachment
                        return (
                          <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                            <Paperclip size={12} />
                            {fileName}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Template Info */}
                <div className="border-t border-gray-200 px-6 py-4 bg-blue-50">
                  <div className="text-xs text-gray-700 space-y-2">
                    <div>
                      <span className="font-semibold">Template:</span> {formData.name || '(Unnamed)'}
                    </div>
                    <div>
                      <span className="font-semibold">Target:</span> {
                        formData.targetType === 'ALL' ? 'All Clients' :
                        formData.targetType === 'HAS_WEBSITE' ? 'Clients with Website' :
                        formData.targetType === 'NO_WEBSITE' ? 'Clients without Website' :
                        formData.targetType.startsWith('CUSTOM_') ?
                          customTargets.find(t => `CUSTOM_${t.id}` === formData.targetType)?.name || 'Custom Target' :
                          'All Clients'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
