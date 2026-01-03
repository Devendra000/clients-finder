"use client"

import { useEffect, useRef } from "react"
import { PhoneIcon, MapPinIcon, BuildingIcon } from "lucide-react"
import type { Client } from "@/types/client"

interface ClientListProps {
  clients: Client[]
  selectedClient: Client | null
  onSelectClient: (client: Client) => void
  isLoading: boolean
}

export function ClientList({ clients, selectedClient, onSelectClient, isLoading }: ClientListProps) {
  const selectedRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [selectedClient])

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
          {clients.map((client) => (
            <div
              key={client.id}
              ref={selectedClient?.id === client.id ? selectedRef : null}
              onClick={() => onSelectClient(client)}
              className={`p-4 cursor-pointer transition-all ${
                selectedClient?.id === client.id
                  ? "bg-blue-50 border-l-4 border-blue-600"
                  : "hover:bg-gray-50 border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{client.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                    <BuildingIcon className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{client.category}</span>
                  </div>
                  <div className="mt-1 flex items-start gap-1 text-xs text-gray-600">
                    <MapPinIcon className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span className="text-xs">{client.address}</span>
                  </div>
                  {client.phone && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                      <PhoneIcon className="h-3 w-3 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
