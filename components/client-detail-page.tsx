"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  PhoneIcon, 
  MapPinIcon, 
  BuildingIcon, 
  Globe, 
  Mail, 
  Clock, 
  MapIcon,
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Save,
  Plus,
  Edit,
  Trash2,
  X,
  Send,
  Calendar
} from "lucide-react"
import type { Client, ClientStatus, Note, AlertType } from "@/types/client"
import { EmailModal } from "./email-modal"
import { AlertDialog } from "./alert-dialog"

interface EmailHistory {
  id: string
  clientId: string
  recipientEmail: string
  subject: string
  body: string
  status: string // 'Sent', 'Failed', or 'Pending'
  reason?: string // Error reason if Failed
  sentAt: string
  method?: string
  createdAt: string
  updatedAt: string
}

interface ClientDetailPageProps {
  client: Client
}

const statusOptions: { value: ClientStatus; label: string; color: string }[] = [
  { value: 'PENDING' as ClientStatus, label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'LEAD' as ClientStatus, label: 'Lead', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'CONTACTED' as ClientStatus, label: 'Contacted', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'REJECTED' as ClientStatus, label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'CLOSED' as ClientStatus, label: 'Closed', color: 'bg-gray-100 text-gray-800 border-gray-300' },
]

export function ClientDetailPage({ client: initialClient }: ClientDetailPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [client, setClient] = useState(initialClient)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [notes, setNotes] = useState<Note[]>(initialClient.notes || [])
  const [newNoteContent, setNewNoteContent] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteContent, setEditingNoteContent] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailHistoryRefresh, setEmailHistoryRefresh] = useState(0)
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([])
  const [loadingEmailHistory, setLoadingEmailHistory] = useState(false)
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
  const [deleteNoteConfirm, setDeleteNoteConfirm] = useState<{
    isOpen: boolean
    noteId?: string
  }>({
    isOpen: false
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedClient, setEditedClient] = useState<Client>(initialClient)
  const [deleteClientConfirm, setDeleteClientConfirm] = useState(false)

  // Debug log
  console.log('Client data:', client)

  useEffect(() => {
    loadEmailHistory()
  }, [client.id, emailHistoryRefresh])

  const loadEmailHistory = async () => {
    setLoadingEmailHistory(true)
    try {
      const response = await fetch(`/api/clients/${client.id}/email-history`)
      const data = await response.json()
      if (data.success) {
        setEmailHistory(data.emailHistory)
      }
    } catch (error) {
      console.error('Error loading email history:', error)
    } finally {
      setLoadingEmailHistory(false)
    }
  }

  const handleStatusChange = async (newStatus: ClientStatus) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      setClient({ ...client, status: newStatus })
    } catch (error) {
      console.error('Error updating status:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update client status'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveClient = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedClient)
      })

      if (!response.ok) {
        throw new Error('Failed to update client')
      }

      const data = await response.json()
      setClient(data.client)
      setIsEditMode(false)
      setAlert({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Client updated successfully'
      })
    } catch (error) {
      console.error('Error updating client:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update client information'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedClient(client)
    setIsEditMode(false)
  }

  const handleDeleteClient = async () => {
    setDeleteClientConfirm(false)
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete client')
      }

      setAlert({
        isOpen: true,
        type: 'success',
        title: 'Deleted',
        message: 'Client deleted successfully'
      })
      
      setTimeout(() => router.push('/'), 1500)
    } catch (error) {
      console.error('Error deleting client:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to delete client'
      })
      setIsUpdating(false)
    }
  }

  const  handleAddNote = async () => {
    if (!newNoteContent.trim()) return

    setIsSavingNote(true)
    try {
      const response = await fetch(`/api/clients/${client.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNoteContent })
      })

      if (!response.ok) {
        throw new Error('Failed to add note')
      }

      const data = await response.json()
      setNotes([data.note, ...notes])
      setNewNoteContent('')
    } catch (error) {
      console.error('Error adding note:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to add note'
      })
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleEditNote = async (noteId: string) => {
    if (!editingNoteContent.trim()) return

    setIsSavingNote(true)
    try {
      const response = await fetch(`/api/clients/${client.id}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingNoteContent })
      })

      if (!response.ok) {
        throw new Error('Failed to update note')
      }

      const data = await response.json()
      setNotes(notes.map(n => n.id === noteId ? data.note : n))
      setEditingNoteId(null)
      setEditingNoteContent('')
    } catch (error) {
      console.error('Error updating note:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update note'
      })
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    setDeleteNoteConfirm({
      isOpen: true,
      noteId
    })
  }

  const confirmDeleteNote = async (noteId: string) => {
    setDeleteNoteConfirm({ isOpen: false })
    try {
      const response = await fetch(`/api/clients/${client.id}/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      setNotes(notes.filter(n => n.id !== noteId))
    } catch (error) {
      console.error('Error deleting note:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to delete note'
      })
    }
  }

  const startEditNote = (note: Note) => {
    setEditingNoteId(note.id)
    setEditingNoteContent(note.content)
  }

  const handleNavigation = async (direction: 'next' | 'prev') => {
    setIsNavigating(true)
    try {
      // Build query params with current filters
      const params = new URLSearchParams({ direction })
      
      // Add filters from search params
      const category = searchParams.get('category')
      const status = searchParams.get('status')
      const hasWebsite = searchParams.get('hasWebsite')
      const hasPhone = searchParams.get('hasPhone')
      const hasEmail = searchParams.get('hasEmail')
      
      if (category && category !== 'all') params.append('category', category)
      if (status && status !== 'all') params.append('status', status)
      if (hasWebsite && hasWebsite !== 'all') params.append('hasWebsite', hasWebsite === 'yes' ? 'true' : 'false')
      if (hasPhone && hasPhone !== 'all') params.append('hasPhone', hasPhone === 'yes' ? 'true' : 'false')
      if (hasEmail && hasEmail !== 'all') params.append('hasEmail', hasEmail === 'yes' ? 'true' : 'false')
      
      const response = await fetch(`/api/clients/${client.id}/navigation?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch navigation')
      }
      
      const data = await response.json()
      if (data.clientId && data.clientId !== client.id) {
        // Preserve filters in the URL when navigating
        const newUrl = `/clients/${data.clientId}?${searchParams.toString()}`
        router.push(newUrl)
      }
    } catch (error) {
      console.error('Error navigating:', error)
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to navigate to next client'
      })
    } finally {
      setIsNavigating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertDialog
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert(prev => ({ ...prev, isOpen: false }))}
        onConfirm={alert.onConfirm}
      />
      <AlertDialog
        isOpen={deleteNoteConfirm.isOpen}
        type="warning"
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        onClose={() => setDeleteNoteConfirm({ isOpen: false })}
        onConfirm={() => deleteNoteConfirm.noteId && confirmDeleteNote(deleteNoteConfirm.noteId)}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <AlertDialog
        isOpen={deleteClientConfirm}
        type="warning"
        title="Delete Client"
        message="Are you sure you want to permanently delete this client? This will remove all data including notes and email history. This action cannot be undone."
        onClose={() => setDeleteClientConfirm(false)}
        onConfirm={handleDeleteClient}
        confirmText="Delete"
        cancelText="Cancel"
      />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Clients
            </button>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {!isEditMode ? (
                <>
                  <button
                    onClick={() => setDeleteClientConfirm(true)}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Client"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setEditedClient(client)
                      setIsEditMode(true)
                    }}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit Client"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleNavigation('prev')}
                    disabled={isNavigating}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous Client"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Previous
                  </button>
                  <button
                    onClick={() => handleNavigation('next')}
                    disabled={isNavigating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next Client"
                  >
                    Next
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveClient}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditMode ? (
                <input
                  type="text"
                  value={editedClient.name}
                  onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                  className="text-3xl font-bold text-gray-900 border-2 border-blue-500 rounded px-2 py-1 w-full max-w-2xl"
                  placeholder="Client Name"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
              )}
              {isEditMode ? (
                <input
                  type="text"
                  value={editedClient.category || ''}
                  onChange={(e) => setEditedClient({ ...editedClient, category: e.target.value })}
                  className="mt-2 text-lg text-gray-600 border-2 border-blue-500 rounded px-2 py-1 w-full max-w-md"
                  placeholder="Category"
                />
              ) : (
                client.category && (
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <BuildingIcon className="h-5 w-5" />
                    <span className="text-lg">{client.category}</span>
                  </div>
                )
              )}
            </div>
            <span className={`px-4 py-2 text-sm font-medium rounded-full ${
              client.status === 'LEAD' ? 'bg-green-100 text-green-800' :
              client.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
              client.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
              client.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {client.status}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Status</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    disabled={isUpdating || client.status === status.value}
                    className={`px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all ${
                      client.status === status.value
                        ? status.color + ' border-2'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {client.status === status.value && <CheckCircle className="inline h-4 w-4 mr-1" />}
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              {isEditMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editedClient.phone || ''}
                      onChange={(e) => setEditedClient({ ...editedClient, phone: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none"
                      placeholder="+977 9841234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editedClient.email || ''}
                      onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none"
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={editedClient.website || ''}
                      onChange={(e) => setEditedClient({ ...editedClient, website: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none"
                      placeholder="https://www.example.com"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {!client.phone && !client.email && !client.website && (
                    <p className="text-gray-500 text-sm">No contact information available</p>
                  )}
                  {client.phone && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <PhoneIcon className="h-6 w-6 text-gray-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 mb-1">Phone</p>
                        <a 
                          href={`tel:${client.phone}`} 
                          className="text-base text-blue-600 hover:underline font-medium"
                        >
                          {client.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {client.email && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <Mail className="h-6 w-6 text-gray-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <button
                          onClick={() => setShowEmailModal(true)}
                          className="text-base text-blue-600 hover:underline font-medium break-all text-left"
                        >
                          {client.email}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {client.website && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <Globe className="h-6 w-6 text-gray-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 mb-1">Website</p>
                        <a 
                          href={client.website?.startsWith('http://') || client.website?.startsWith('https://') ? client.website : `https://${client.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-base text-blue-600 hover:underline font-medium break-all"
                        >
                          {client.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional Information */}
            {(client.openingHours || client.facilities) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
                <div className="space-y-4">
                  {client.openingHours && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <Clock className="h-6 w-6 text-gray-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 mb-1">Opening Hours</p>
                        <p className="text-base text-gray-900">{client.openingHours}</p>
                      </div>
                    </div>
                  )}
                  
                  {client.facilities && (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <BuildingIcon className="h-6 w-6 text-gray-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 mb-1">Facilities</p>
                        <p className="text-base text-gray-900">{client.facilities}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes ({notes.length})
                </h2>
              </div>

              {/* Add New Note */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Add a new note..."
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
                <button
                  onClick={handleAddNote}
                  disabled={isSavingNote || !newNoteContent.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  {isSavingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No notes yet. Add your first note above.</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                      {editingNoteId === note.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingNoteContent}
                            onChange={(e) => setEditingNoteContent(e.target.value)}
                            className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditNote(note.id)}
                              disabled={isSavingNote}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                            >
                              <Save className="h-3 w-3" />
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingNoteId(null)
                                setEditingNoteContent('')
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                            >
                              <X className="h-3 w-3" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-xs text-gray-500">
                              {new Date(note.createdAt).toLocaleString()}
                            </p>
                            <div className="flex gap-1">
                              <button
                                onClick={() => startEditNote(note)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Edit note"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Delete note"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Email History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Send className="h-5 w-5" />
                Email History
              </h3>
              {loadingEmailHistory ? (
                <p className="text-sm text-gray-500">Loading email history...</p>
              ) : emailHistory.length === 0 ? (
                <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                  No emails sent yet
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {emailHistory.map((email) => (
                    <div key={email.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{email.subject}</p>
                          <p className="text-xs text-gray-600 truncate">{email.recipientEmail}</p>
                        </div>
                        <div className="flex gap-1">
                          {email.method && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                              {email.method}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium ${
                            email.status === 'Sent' ? 'bg-green-100 text-green-800' :
                            email.status === 'Failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {email.status}
                          </span>
                        </div>
                      </div>
                      {email.status === 'Failed' && email.reason && (
                        <p className="text-xs text-red-600 mb-2 break-words">Error: {email.reason}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(email.sentAt).toLocaleDateString()} at {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Future Features Placeholder */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Coming Soon</h3>
              <p className="text-sm text-blue-700">
                Chat with client, activity timeline, and more features will be available here.
              </p>
            </div>
          </div>

          {/* Right Column - Location */}
          <div className="space-y-6">
            {/* Location Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
              {isEditMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                    <textarea
                      value={editedClient.address || ''}
                      onChange={(e) => setEditedClient({ ...editedClient, address: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none min-h-[60px]"
                      placeholder="Full address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                    <input
                      type="text"
                      value={editedClient.street || ''}
                      onChange={(e) => setEditedClient({ ...editedClient, street: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none"
                      placeholder="Street"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={editedClient.city || ''}
                        onChange={(e) => setEditedClient({ ...editedClient, city: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={editedClient.state || ''}
                        onChange={(e) => setEditedClient({ ...editedClient, state: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none"
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
                      <input
                        type="text"
                        value={editedClient.postcode || ''}
                        onChange={(e) => setEditedClient({ ...editedClient, postcode: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none"
                        placeholder="Postcode"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={editedClient.country || ''}
                        onChange={(e) => setEditedClient({ ...editedClient, country: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="h-6 w-6 text-gray-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 mb-2">Full Address</p>
                        <p className="text-base text-gray-900 mb-3">{client.address}</p>
                        
                        <div className="space-y-2 text-sm">
                          {client.street && (
                            <div className="flex">
                              <span className="text-gray-500 w-20">Street:</span>
                              <span className="text-gray-900">{client.street}</span>
                            </div>
                          )}
                          {client.city && (
                            <div className="flex">
                              <span className="text-gray-500 w-20">City:</span>
                              <span className="text-gray-900">{client.city}</span>
                            </div>
                          )}
                          {client.state && (
                            <div className="flex">
                              <span className="text-gray-500 w-20">State:</span>
                              <span className="text-gray-900">{client.state}</span>
                            </div>
                          )}
                          {client.postcode && (
                            <div className="flex">
                              <span className="text-gray-500 w-20">Postcode:</span>
                              <span className="text-gray-900">{client.postcode}</span>
                            </div>
                          )}
                          {client.country && (
                            <div className="flex">
                              <span className="text-gray-500 w-20">Country:</span>
                              <span className="text-gray-900">{client.country} {client.countryCode && `(${client.countryCode})`}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {client.latitude && client.longitude && (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapIcon className="h-6 w-6 text-gray-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 mb-1">Coordinates</p>
                        <p className="text-sm font-mono text-gray-900">
                          {client.latitude.toFixed(6)}, {client.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${client.longitude - 0.01},${client.latitude - 0.01},${client.longitude + 0.01},${client.latitude + 0.01}&layer=mapnik&marker=${client.latitude},${client.longitude}`}
                      className="w-full h-64 border-0"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                </>
              )}
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium text-gray-700">Added:</span>
                  <p className="mt-1">{new Date(client.createdAt).toLocaleDateString()} at {new Date(client.createdAt).toLocaleTimeString()}</p>
                </div>
                {client.datasource && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-700">Source:</span>
                    <p className="mt-1 text-xs">{client.datasource}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Email Modal */}
      {showEmailModal && client.email && (
        <EmailModal
          client={client}
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onEmailSent={() => setEmailHistoryRefresh(prev => prev + 1)}
        />
      )}
    </div>
  )
}
