"use client"

import { useState, useCallback, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { FetchClients } from "./fetch-clients"
import { SearchBar } from "./search-bar"
import { MapView } from "./map-view"
import { ClientList } from "./client-list"
import { ClientDetail } from "./client-detail"
import type { Client, ClientStatus } from "@/types/client"

export function ClientFinderApp() {
  const [currentView, setCurrentView] = useState<"clients" | "fetch">("clients")
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Load all clients on mount
  useEffect(() => {
    if (currentView === "clients") {
      loadAllClients()
    }
  }, [currentView])

  const loadAllClients = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/clients")

      if (!response.ok) {
        throw new Error("Failed to fetch clients")
      }

      const data = await response.json()
      setClients(data.clients || [])

      if (data.clients?.length === 0) {
        setError("No clients found. Try fetching some clients first!")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = useCallback(async (searchQuery: string) => {
    setLoading(true)
    setError(null)
    setSearchQuery(searchQuery)

    try {
      // Build query parameters for the backend API
      const params = new URLSearchParams()
      
      if (searchQuery && searchQuery.trim().length > 0) {
        params.append("search", searchQuery.trim())
      }

      // Fetch from the real backend API
      const response = await fetch(`/api/clients?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch clients")
      }

      const data = await response.json()
      setClients(data.clients || [])

      if (data.clients?.length === 0) {
        if (searchQuery && searchQuery.trim()) {
          setError(`No clients found matching "${searchQuery}". Try a different search term.`)
        } else {
          setError("No clients found. Try fetching some clients first!")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while searching")
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleClientsFetched = useCallback(() => {
    // Switch to clients view and reload
    setCurrentView("clients")
    loadAllClients()
  }, [loadAllClients])

  const handleStatusChange = useCallback((clientId: string, newStatus: ClientStatus) => {
    setClients(prevClients => 
      prevClients.map(c => 
        c.id === clientId ? { ...c, status: newStatus } : c
      )
    )
    if (selectedClient?.id === clientId) {
      setSelectedClient(prev => prev ? { ...prev, status: newStatus } : null)
    }
  }, [selectedClient])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentView === "fetch" ? (
          /* Fetch Clients View */
          <div className="flex-1 overflow-y-auto py-8">
            <FetchClients onClientsFetched={handleClientsFetched} />
          </div>
        ) : (
          /* Clients View */
          <>
            {/* Header with Search */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
              <div className="px-6 py-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">My Clients</h2>
                  <p className="text-gray-600 mt-1">Search and manage your clients database</p>
                </div>
                <SearchBar onSearch={handleSearch} isLoading={loading} />
              </div>
            </header>

            {/* Error Message */}
            {error && (
              <div className="px-6 py-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  {error}
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden">
              <div className="h-full flex gap-4 p-6">
                {/* Map View */}
                <div className="flex-1 rounded-lg overflow-hidden border border-gray-200 shadow bg-white">
                  <MapView clients={clients} selectedClient={selectedClient} />

                {/* Client Detail Panel */}
                {selectedClient && (
                  <div className="w-96 rounded-lg overflow-hidden border border-gray-200 shadow bg-white flex flex-col">
                    <ClientDetail 
                      client={selectedClient}
                      onClose={() => setSelectedClient(null)}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                )}
                </div>

                {/* Client List */}
                <div className="w-96 rounded-lg overflow-hidden border border-gray-200 shadow bg-white flex flex-col">
                  <ClientList
                    clients={clients}
                    selectedClient={selectedClient}
                    onSelectClient={setSelectedClient}
                    searchQuery={searchQuery}
                    isLoading={loading}
                  />
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  )
}
