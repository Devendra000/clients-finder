"use client"

import { useState, useCallback } from "react"
import { SearchBar } from "./search-bar"
import { MapView } from "./map-view"
import { ClientList } from "./client-list"
import type { Client } from "@/types/client"

export function ClientFinderApp() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async (category: string, location: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/clients/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, location }),
      })

      if (!response.ok) {
        throw new Error("Failed to search clients")
      }

      const data = await response.json()
      setClients(data.clients || [])

      if (data.clients?.length === 0) {
        setError("No clients found for your search. Try different filters.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while searching")
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Clients Finder</h1>
            <p className="text-gray-600 mt-2">Search and discover businesses by category and location</p>
          </div>
          <SearchBar onSearch={handleSearch} isLoading={loading} />
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row gap-4 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          {/* Map View */}
          <div className="flex-1 rounded-lg overflow-hidden border border-gray-200 shadow">
            <MapView clients={clients} selectedClient={selectedClient} />
          </div>

          {/* Client List */}
          <div className="w-full lg:w-96 rounded-lg overflow-hidden border border-gray-200 shadow bg-white flex flex-col">
            <ClientList
              clients={clients}
              selectedClient={selectedClient}
              onSelectClient={setSelectedClient}
              isLoading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
