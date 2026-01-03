"use client"

import { useState } from "react"
import { 
  PhoneIcon, 
  MapPinIcon, 
  BuildingIcon, 
  Globe, 
  Mail, 
  Clock, 
  MapIcon,
  X,
  CheckCircle,
  XCircle,
  Phone,
  MessageSquare
} from "lucide-react"
import type { Client, ClientStatus } from "@/types/client"

interface ClientDetailProps {
  client: Client
  onClose: () => void
  onStatusChange: (clientId: string, newStatus: ClientStatus) => void
}

const statusOptions: { value: ClientStatus; label: string; color: string }[] = [
  { value: 'PENDING' as ClientStatus, label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'LEAD' as ClientStatus, label: 'Lead', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'CONTACTED' as ClientStatus, label: 'Contacted', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'REJECTED' as ClientStatus, label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'CLOSED' as ClientStatus, label: 'Closed', color: 'bg-gray-100 text-gray-800 border-gray-300' },
]

export function ClientDetail({ client, onClose, onStatusChange }: ClientDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false)

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

      onStatusChange(client.id, newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update client status')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-gray-200">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-gray-900 truncate">{client.name}</h2>
          {client.category && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <BuildingIcon className="h-4 w-4" />
              <span>{client.category}</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                disabled={isUpdating || client.status === status.value}
                className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                  client.status === status.value
                    ? status.color + ' border-2'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {client.status === status.value && <CheckCircle className="inline h-3 w-3 mr-1" />}
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div className="space-y-3">
            {client.phone && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <PhoneIcon className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <a 
                    href={`tel:${client.phone}`} 
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    {client.phone}
                  </a>
                </div>
              </div>
            )}
            
            {client.email && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <a 
                    href={`mailto:${client.email}`} 
                    className="text-sm text-blue-600 hover:underline font-medium break-all"
                  >
                    {client.email}
                  </a>
                </div>
              </div>
            )}
            
            {client.website && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Globe className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Website</p>
                  <a 
                    href={client.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-blue-600 hover:underline font-medium break-all"
                  >
                    {client.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Location</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm text-gray-900">{client.address}</p>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    {client.city && (
                      <div>
                        <span className="text-gray-500">City: </span>
                        <span className="text-gray-900">{client.city}</span>
                      </div>
                    )}
                    {client.state && (
                      <div>
                        <span className="text-gray-500">State: </span>
                        <span className="text-gray-900">{client.state}</span>
                      </div>
                    )}
                    {client.postcode && (
                      <div>
                        <span className="text-gray-500">Postcode: </span>
                        <span className="text-gray-900">{client.postcode}</span>
                      </div>
                    )}
                    {client.country && (
                      <div>
                        <span className="text-gray-500">Country: </span>
                        <span className="text-gray-900">{client.country}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {client.latitude && client.longitude && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapIcon className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Coordinates</p>
                    <p className="text-sm font-mono text-gray-900">
                      {client.latitude.toFixed(6)}, {client.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        {(client.openingHours || client.facilities) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Additional Details</h3>
            <div className="space-y-3">
              {client.openingHours && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">Opening Hours</p>
                      <p className="text-sm text-gray-900">{client.openingHours}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {client.facilities && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <BuildingIcon className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">Facilities</p>
                      <p className="text-sm text-gray-900">{client.facilities}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <span className="font-medium">Added: </span>
              {new Date(client.createdAt).toLocaleDateString()} at {new Date(client.createdAt).toLocaleTimeString()}
            </p>
            {client.datasource && (
              <p>
                <span className="font-medium">Source: </span>
                {client.datasource}
              </p>
            )}
          </div>
        </div>

        {/* Placeholder for future features */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">Coming Soon</p>
          <p className="text-xs text-blue-600 mt-1">Chat, notes, and activity tracking will be available here</p>
        </div>
      </div>
    </div>
  )
}
