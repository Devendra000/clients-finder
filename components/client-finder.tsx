"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { FetchClients } from "./fetch-clients"
import { SearchBar } from "./search-bar"
import { ClientList } from "./client-list"
import { FilterPanel } from "./filter-panel"
import { TemplateManager } from "./template-manager"
import type { Client, FilterOptions } from "@/types/client"

export function ClientFinderApp() {
  const [currentView, setCurrentView] = useState<"clients" | "fetch" | "templates">("clients")
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchLocation, setSearchLocation] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [filters, setFilters] = useState<FilterOptions>({
    category: "all",
    status: "all",
    website: "all",
    phone: "all",
    email: "all",
  })

  const loadAllClients = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/clients")

      if (response.ok) {
        const data = await response.json()
        const clientsWithFlags = (data.clients || []).map((client: Client) => ({
          ...client,
          hasWebsite: !!client.website,
          hasPhone: !!client.phone,
          hasEmail: !!client.email,
        }))
        setClients(clientsWithFlags)
      }
    } catch (err) {
      console.error("Error loading initial data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentView === "clients") {
      loadAllClients()
    }
  }, [currentView, loadAllClients])

  const handleClientsFetched = useCallback(() => {
    // Just refresh the data without changing view
    loadAllClients()
  }, [loadAllClients])

  // Get unique categories from current clients (split multi-category values)
  const categories = useMemo(() => {
    const cats = new Set<string>()
    clients.forEach((client) => {
      if (client.category) {
        // Split by semicolon in case multiple categories
        const categoryList = client.category.split(';').map(c => c.trim()).filter(c => c)
        categoryList.forEach(cat => cats.add(cat))
      }
    })
    return Array.from(cats).sort()
  }, [clients])

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Location/search filter
      if (searchLocation && searchLocation.trim()) {
        const search = searchLocation.toLowerCase()
        const matchesSearch = 
          client.name.toLowerCase().includes(search) ||
          client.address.toLowerCase().includes(search) ||
          (client.category && client.category.toLowerCase().includes(search))
        if (!matchesSearch) return false
      }

      // Category filter
      const categoryMatch = filters.category === "all" || client.category === filters.category
      
      // Status filter
      const statusMatch = filters.status === "all" || client.status === filters.status
      
      // Website filter
      const websiteMatch =
        filters.website === "all" ||
        (filters.website === "yes" && client.hasWebsite) ||
        (filters.website === "no" && !client.hasWebsite)
      
      // Phone filter
      const phoneMatch =
        filters.phone === "all" ||
        (filters.phone === "yes" && client.hasPhone) ||
        (filters.phone === "no" && !client.hasPhone)
      
      // Email filter
      const emailMatch =
        filters.email === "all" ||
        (filters.email === "yes" && client.hasEmail) ||
        (filters.email === "no" && !client.hasEmail)

      return categoryMatch && statusMatch && websiteMatch && phoneMatch && emailMatch
    })
  }, [clients, filters, searchLocation])

  const handleSearch = useCallback(
    async (location: string) => {
      setSearchLocation(location)
      // Filtering is done client-side via useMemo above
    },
    [],
  )

  const handleExportToExcel = useCallback(async () => {
    try {
      // Build query params based on current filters
      const params = new URLSearchParams()
      
      if (filters.category !== "all") {
        params.append("category", filters.category)
      }
      if (filters.status !== "all") {
        params.append("status", filters.status.toUpperCase())
      }
      if (filters.website !== "all") {
        params.append("hasWebsite", filters.website === "yes" ? "true" : "false")
      }
      if (filters.phone !== "all") {
        params.append("hasPhone", filters.phone === "yes" ? "true" : "false")
      }
      if (filters.email !== "all") {
        params.append("hasEmail", filters.email === "yes" ? "true" : "false")
      }

      // Fetch the Excel file
      const response = await fetch(`/api/clients/export?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error("Failed to export data")
      }

      // Get the blob and create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `clients_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export error:", error)
      setError("Failed to export data. Please try again.")
    }
  }, [filters])

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
          if (view === "templates") {
            window.location.href = "/templates"
          } else {
            setCurrentView(view)
          }
          setIsMobileMenuOpen(false)
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentView === "fetch" ? (
          <div className="flex-1 overflow-y-auto py-8">
            <FetchClients onClientsFetched={handleClientsFetched} />
          </div>
        ) : currentView === "templates" ? (
          <div className="flex-1 overflow-y-auto">
            <TemplateManager />
          </div>
        ) : (
          <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <header className="bg-white border-b border-border shadow-sm">
              <div className="px-4 py-4 sm:px-6 sm:py-6">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Clients</h1>
                    <p className="text-muted-foreground text-sm sm:text-base mt-1">
                      Search and discover businesses by category and location
                    </p>
                  </div>
                  <button
                    onClick={handleExportToExcel}
                    disabled={filteredClients.length === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap self-start sm:self-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export to Excel ({filteredClients.length})
                  </button>
                </div>
                <SearchBar onSearch={handleSearch} isLoading={loading} />
              </div>
            </header>

            {/* Error Message */}
            {error && <div className="px-4 py-3 sm:px-6 bg-red-50 border-b border-red-200 text-red-800 text-sm">{error}</div>}

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Left: Filter Panel */}
              <aside className="hidden lg:block w-80 border-r border-border bg-white overflow-y-auto">
                <div className="sticky top-0 bg-white p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Filters</h2>
                  <FilterPanel filters={filters} onFilterChange={setFilters} categories={categories} />
                </div>
              </aside>

              {/* Right: Client List */}
              <div className="flex-1 overflow-y-auto">
                <ClientList
                  clients={filteredClients}
                  selectedClient={selectedClient}
                  onSelectClient={setSelectedClient}
                  isLoading={loading}
                  filters={filters}
                />
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  )
}
