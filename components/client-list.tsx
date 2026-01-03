"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { PhoneIcon, MapPinIcon, BuildingIcon, Globe, Mail, Clock, ChevronDown, ChevronUp, MapIcon, Eye } from "lucide-react"
import type { Client } from "@/types/client"

interface ClientListProps {
  clients: Client[]
  selectedClient: Client | null
  onSelectClient: (client: Client) => void
  isLoading: boolean
}

export function ClientList({ clients, selectedClient, onSelectClient, isLoading }: ClientListProps) {
  const selectedRef = useRef<HTMLDivElement | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [selectedClient])

  const toggleExpand = (clientId: string) => {
    setExpandedId(expandedId === clientId ? null : clientId)
  }

  const handleViewClient = (clientId: string) => {
    router.push(`/clients/${clientId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-gray-500">
          <BuildingIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>No clients found. Try searching by category and location.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Results ({clients.length})</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-200">
          {clients.map((client) => {
            const isExpanded = expandedId === client.id
            const isSelected = selectedClient?.id === client.id
            
            return (
              <div
                key={client.id}
                ref={isSelected ? selectedRef : null}
                className={`transition-all ${
                  isSelected
                    ? "bg-blue-50 border-l-4 border-blue-600"
                    : "hover:bg-gray-50 border-l-4 border-transparent"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onSelectClient(client)}
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="text-base font-semibold text-gray-900">{client.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          client.status === 'LEAD' ? 'bg-green-100 text-green-800' :
                          client.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                          client.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          client.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                      
                      <div className="mt-2 space-y-1.5">
                        {client.category && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BuildingIcon className="h-4 w-4 flex-shrink-0" />
                            <span>{client.category}</span>
                          </div>
                        )}
                        
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>{client.address}</span>
                        </div>
                        
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                            <a href={`tel:${client.phone}`} className="hover:text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                              {client.phone}
                            </a>
                          </div>
                        )}
                        
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <a href={`mailto:${client.email}`} className="hover:text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                              {client.email}
                            </a>
                          </div>
                        )}
                        
                        {client.website && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Globe className="h-4 w-4 flex-shrink-0" />
                            <a href={client.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline truncate" onClick={(e) => e.stopPropagation()}>
                              {client.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleViewClient(client.id)}
                      className="flex-shrink-0 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </div>
                </div>
                
                {/* Expandable Details Section */}
                <div className="px-4 pb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpand(client.id)
                    }}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show more details
                      </>
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-sm">
                      {client.street && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500 font-medium">Street:</span>
                          <span className="col-span-2 text-gray-900">{client.street}</span>
                        </div>
                      )}
                      
                      {client.city && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500 font-medium">City:</span>
                          <span className="col-span-2 text-gray-900">{client.city}</span>
                        </div>
                      )}
                      
                      {client.state && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500 font-medium">State:</span>
                          <span className="col-span-2 text-gray-900">{client.state}</span>
                        </div>
                      )}
                      
                      {client.postcode && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500 font-medium">Postcode:</span>
                          <span className="col-span-2 text-gray-900">{client.postcode}</span>
                        </div>
                      )}
                      
                      {client.country && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500 font-medium">Country:</span>
                          <span className="col-span-2 text-gray-900">{client.country} {client.countryCode && `(${client.countryCode})`}</span>
                        </div>
                      )}
                      
                      {client.latitude && client.longitude && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500 font-medium flex items-center gap-1">
                            <MapIcon className="h-3 w-3" />
                            Coordinates:
                          </span>
                          <span className="col-span-2 text-gray-900 font-mono text-xs">
                            {client.latitude.toFixed(6)}, {client.longitude.toFixed(6)}
                          </span>
                        </div>
                      )}
                      
                      {client.openingHours && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500 font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Hours:
                          </span>
                          <span className="col-span-2 text-gray-900">{client.openingHours}</span>
                        </div>
                      )}
                      
                      {client.facilities && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500 font-medium">Facilities:</span>
                          <span className="col-span-2 text-gray-900">{client.facilities}</span>
                        </div>
                      )}
                      
                      {client.datasource && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-gray-500 font-medium">Source:</span>
                          <span className="col-span-2 text-gray-900 text-xs">{client.datasource}</span>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
                        <span className="font-medium">Added:</span>
                        <span className="col-span-2">{new Date(client.createdAt).toLocaleDateString()} {new Date(client.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
