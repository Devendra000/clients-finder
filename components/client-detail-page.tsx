"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  PhoneIcon, 
  MapPinIcon, 
  BuildingIcon, 
  Globe, 
  Mail, 
  Clock, 
  MapIcon,
  ArrowLeft,
  CheckCircle
} from "lucide-react"
import type { Client, ClientStatus } from "@/types/client"

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
  const [client, setClient] = useState(initialClient)
  const [isUpdating, setIsUpdating] = useState(false)

  // Debug log
  console.log('Client data:', client)

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
      alert('Failed to update client status')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Clients
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
              {client.category && (
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <BuildingIcon className="h-5 w-5" />
                  <span className="text-lg">{client.category}</span>
                </div>
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
                      <a 
                        href={`mailto:${client.email}`} 
                        className="text-base text-blue-600 hover:underline font-medium break-all"
                      >
                        {client.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {client.website && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Globe className="h-6 w-6 text-gray-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 mb-1">Website</p>
                      <a 
                        href={client.website} 
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

            {/* Future Features Placeholder */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Coming Soon</h3>
              <p className="text-sm text-blue-700">
                Chat with client, notes, activity timeline, and more features will be available here.
              </p>
            </div>
          </div>

          {/* Right Column - Location */}
          <div className="space-y-6">
            {/* Location Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
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
    </div>
  )
}
