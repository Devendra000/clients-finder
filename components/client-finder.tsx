"use client"

import { useState, useCallback, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { FetchClients } from "./fetch-clients"
import { SearchBar } from "./search-bar"
import { StatusFilter } from "./status-filter"
import { AdvancedFilters } from "./advanced-filters"
import { MapView } from "./map-view"
import { ClientList } from "./client-list"
import type { Client, ClientStatus } from "@/types/client"

export function ClientFinderApp() {
  const [currentView, setCurrentView] = useState<"clients" | "fetch">("clients")
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<ClientStatus | "ALL">("ALL")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<{
    website: "all" | "has" | "no"
    phone: "all" | "has" | "no"
    email: "all" | "has" | "no"
  }>({
    website: "all",
    phone: "all",
    email: "all",
  })

  // Load filters from localStorage after mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem("clientFilters")
    if (saved) {
      try {
        setAdvancedFilters(JSON.parse(saved))
      } catch (e) {
        // If parsing fails, keep defaults
      }
    }
  }, [])

  // Load all clients on mount or when returning to clients view
  useEffect(() => {
    if (currentView === "clients") {
      // Re-apply current filters when loading
      handleSearch(searchQuery, selectedStatus, advancedFilters)
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

  const handleSearch = useCallback(async (
    searchQuery: string, 
    statusFilter?: ClientStatus | "ALL",
    filters?: typeof advancedFilters
  ) => {
    setLoading(true)
    setError(null)
    setSearchQuery(searchQuery)

    try {
      // Build query parameters for the backend API
      const params = new URLSearchParams()
      
      if (searchQuery && searchQuery.trim().length > 0) {
        params.append("search", searchQuery.trim())
      }

      // Add status filter if not "ALL"
      const status = statusFilter !== undefined ? statusFilter : selectedStatus
      if (status !== "ALL") {
        params.append("status", status)
      }

      // Add advanced filters - use passed filters or current state
      const currentFilters = filters || advancedFilters
      if (currentFilters.website !== "all") {
        params.append("hasWebsite", currentFilters.website === "has" ? "true" : "false")
      }
      if (currentFilters.phone !== "all") {
        params.append("hasPhone", currentFilters.phone === "has" ? "true" : "false")
      }
      if (currentFilters.email !== "all") {
        params.append("hasEmail", currentFilters.email === "has" ? "true" : "false")
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
        } else if (status !== "ALL") {
          setError(`No clients found with status "${status}".`)
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
  }, [selectedStatus, advancedFilters])

  const handleStatusChange = useCallback((status: ClientStatus | "ALL") => {
    setSelectedStatus(status)
    handleSearch(searchQuery, status)
  }, [searchQuery, handleSearch])

  const handleAdvancedFiltersChange = useCallback((filters: typeof advancedFilters) => {
    setAdvancedFilters(filters)
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("clientFilters", JSON.stringify(filters))
    }
    // Pass the new filters directly to avoid stale state
    handleSearch(searchQuery, selectedStatus, filters)
  }, [searchQuery, selectedStatus, handleSearch])

  const handleClearFilters = useCallback(() => {
    const defaultFilters = {
      website: "all" as const,
      phone: "all" as const,
      email: "all" as const,
    }
    setAdvancedFilters(defaultFilters)
    // Clear from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("clientFilters")
    }
    // Re-search with cleared filters
    handleSearch(searchQuery, selectedStatus, defaultFilters)
  }, [searchQuery, selectedStatus, handleSearch])

  const handleClientsFetched = useCallback(() => {
    // Switch to clients view and reload
    setCurrentView("clients")
    loadAllClients()
  }, [loadAllClients])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg lg:hidden"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={(view) => {
          setCurrentView(view)
          setIsMobileMenuOpen(false)
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

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
              <div className="px-4 lg:px-6 py-3 lg:py-6">
                <div className="mb-2 lg:mb-4">
                  <h2 className="text-lg lg:text-2xl font-bold text-gray-900">My Clients</h2>
                  <p className="text-xs lg:text-base text-gray-600 mt-0.5 lg:mt-1 hidden sm:block">Search and manage your clients database</p>
                </div>
                <div className="space-y-2 lg:space-y-4">
                  <SearchBar onSearch={(query) => handleSearch(query)} isLoading={loading} />
                  <StatusFilter selectedStatus={selectedStatus} onStatusChange={handleStatusChange} />
                  <AdvancedFilters 
                    filters={advancedFilters} 
                    onFiltersChange={handleAdvancedFiltersChange}
                    onClearFilters={handleClearFilters}
                  />
                </div>
              </div>
            </header>

            {/* Error Message */}
            {error && (
              <div className="px-4 lg:px-6 py-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 lg:p-4 text-sm lg:text-base text-red-800">
                  {error}
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden lg:overflow-hidden">
              <div className="h-full flex flex-col lg:flex-row gap-4 p-4 lg:p-6">
                {/* Map View - Hidden on mobile, shown on desktop */}
                <div className="hidden lg:flex flex-1 rounded-lg overflow-hidden border border-gray-200 shadow bg-white">
                  <MapView clients={clients} selectedClient={selectedClient} />
                </div>

                {/* Client List - Full width on mobile, fixed width on desktop */}
                <div className="flex-1 lg:w-96 lg:flex-none rounded-lg overflow-hidden border border-gray-200 shadow bg-white flex flex-col">
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
