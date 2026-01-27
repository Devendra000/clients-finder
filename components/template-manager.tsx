"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import type { EmailTemplate, TemplateTargetType } from "@/types/client"

export function TemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    targetType: 'ALL' as TemplateTargetType
  })

  useEffect(() => {
    loadTemplates()
  }, [])

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
        alert('Failed to create template')
      }
    } catch (error) {
      console.error('Error creating template:', error)
      alert('Error creating template')
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
        alert('Failed to update template')
      }
    } catch (error) {
      console.error('Error updating template:', error)
      alert('Error updating template')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadTemplates()
      } else {
        alert('Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error deleting template')
    }
  }

  const startEdit = (template: EmailTemplate) => {
    setEditingId(template.id)
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      targetType: template.targetType
    })
    setIsCreating(false)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      targetType: 'ALL' as TemplateTargetType
    })
    setIsCreating(false)
    setEditingId(null)
  }

  const targetTypeLabels = {
    ALL: 'All Clients',
    HAS_WEBSITE: 'Clients with Website',
    NO_WEBSITE: 'Clients without Website'
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading templates...</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <button
          onClick={() => {
            resetForm()
            setIsCreating(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {isCreating ? 'Create New Template' : 'Edit Template'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., No Website - Web Design Offer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Type
              </label>
              <select
                value={formData.targetType}
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value as TemplateTargetType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Clients</option>
                <option value="HAS_WEBSITE">Clients with Website</option>
                <option value="NO_WEBSITE">Clients without Website</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Exclusive Web Design Offer for Your Business"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Body
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Dear [Client Name],&#10;&#10;We noticed you don't have a website yet...&#10;&#10;Use {{CLIENT_NAME}}, {{CLIENT_ADDRESS}} as placeholders"
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use placeholders: {'{'}{'{'} CLIENT_NAME{'}'}{'}'}, {'{'}{'{'} CLIENT_ADDRESS{'}'}{'}'}, {'{'}{'{'} CLIENT_EMAIL{'}'}{'}'}, {'{'}{'{'} CLIENT_PHONE{'}'}{'}'}, {'{'}{'{'} CLIENT_WEBSITE{'}'}{'}'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => isCreating ? handleCreate() : handleUpdate(editingId!)}
                disabled={!formData.name || !formData.subject || !formData.body}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                {isCreating ? 'Create Template' : 'Save Changes'}
              </button>
              <button
                onClick={resetForm}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                    {targetTypeLabels[template.targetType]}
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
