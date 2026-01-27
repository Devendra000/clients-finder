"use client"

import { useEffect, useRef, useState } from "react"
import {
  PhoneIcon,
  MapPinIcon,
  BuildingIcon,
  MailIcon,
  GlobeIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon,
  Copy,
  Check,
} from "lucide-react"
import type { Client, FilterOptions } from "@/types/client"

// Helper to format category labels
const formatCategoryLabel = (category: string | undefined) => {
  if (!category) return "Uncategorized"
  // If it's a Geoapify category (e.g., "education.school"), format it nicely
  if (category.includes('.')) {
    const parts = category.split('.')
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' - ')
  }
  // Otherwise just capitalize
  return category.charAt(0).toUpperCase() + category.slice(1)
}

interface ClientListProps {
  clients: Client[]
  selectedClient: Client | null
  onSelectClient: (client: Client) => void
  isLoading: boolean
  filters?: FilterOptions
}

const STATUS_STYLES = {
  ACTIVE: {
    badge: "bg-emerald-100 text-emerald-700 border border-emerald-300",
    card: "border-l-emerald-500 hover:bg-emerald-50",
    icon: CheckCircleIcon,
    label: "Active",
  },
  INACTIVE: {
    badge: "bg-neutral-100 text-neutral-700 border border-neutral-300",
    card: "border-l-neutral-400 hover:bg-neutral-50",
    icon: AlertCircleIcon,
    label: "Inactive",
  },
  PENDING: {
    badge: "bg-amber-100 text-amber-700 border border-amber-300",
    card: "border-l-amber-500 hover:bg-amber-50",
    icon: ClockIcon,
    label: "Pending",
  },
  LEAD: {
    badge: "bg-green-100 text-green-700 border border-green-300",
    card: "border-l-green-500 hover:bg-green-50",
    icon: CheckCircleIcon,
    label: "Lead",
  },
  CONTACTED: {
    badge: "bg-blue-100 text-blue-700 border border-blue-300",
    card: "border-l-blue-500 hover:bg-blue-50",
    icon: ClockIcon,
    label: "Contacted",
  },
  REJECTED: {
    badge: "bg-red-100 text-red-700 border border-red-300",
    card: "border-l-red-500 hover:bg-red-50",
    icon: AlertCircleIcon,
    label: "Rejected",
  },
  CLOSED: {
    badge: "bg-gray-100 text-gray-700 border border-gray-300",
    card: "border-l-gray-500 hover:bg-gray-50",
    icon: CheckCircleIcon,
    label: "Closed",
  },
}

export function ClientList({ clients, selectedClient, onSelectClient, isLoading, filters }: ClientListProps) {
  const selectedRef = useRef<HTMLDivElement | null>(null)
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [selectedClient])

  const copyPhoneNumber = async (phone: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(phone)
      setCopiedPhone(phone)
      setTimeout(() => setCopiedPhone(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Build filter query params
  const buildFilterParams = () => {
    if (!filters) return ''
    
    const params = new URLSearchParams()
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category)
    }
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status)
    }
    if (filters.website && filters.website !== 'all') {
      params.append('hasWebsite', filters.website)
    }
    if (filters.phone && filters.phone !== 'all') {
      params.append('hasPhone', filters.phone)
    }
    if (filters.email && filters.email !== 'all') {
      params.append('hasEmail', filters.email)
    }
    
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground text-sm">Loading clients...</p>
        </div>
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-muted-foreground">
          <BuildingIcon className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-sm">No clients found. Try a different search or adjust filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-muted/50 sticky top-0 z-10">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Results ({clients.length})</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-border">
          {clients.map((client) => {
            const statusStyle = STATUS_STYLES[client.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.PENDING
            const StatusIcon = statusStyle.icon

            return (
              <div
                key={client.id}
                ref={selectedClient?.id === client.id ? selectedRef : null}
                className={`p-3 sm:p-4 transition-all border-l-4 ${
                  selectedClient?.id === client.id ? "bg-primary/5 border-l-primary shadow-sm" : statusStyle.card
                }`}
              >
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onSelectClient(client)}
                    >
                      <h3 className="text-sm sm:text-base font-semibold text-foreground flex-1 line-clamp-2 break-words">
                        {client.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${statusStyle.badge}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        <span className="hidden sm:inline">{statusStyle.label}</span>
                      </div>
                      <a
                        href={`/clients/${client.id}${buildFilterParams()}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        View
                      </a>
                    </div>
                  </div>

                  <div 
                    className="cursor-pointer"
                    onClick={() => onSelectClient(client)}
                  >
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <BuildingIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{formatCategoryLabel(client.category)}</span>
                    </div>

                    <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                      <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2 break-words">{client.address}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-border">
                    {client.hasPhone && client.phone && (
                      <>
                        {client.phone.split(/[;,]/).map((phone, idx) => {
                          const trimmedPhone = phone.trim()
                          if (!trimmedPhone) return null
                          
                          return (
                            <div key={idx} className="inline-flex items-center gap-1">
                              <a
                                href={`tel:${trimmedPhone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex-shrink-0"
                                title={trimmedPhone}
                              >
                                <PhoneIcon className="h-3 w-3" />
                                <span className="hidden sm:inline">{trimmedPhone}</span>
                              </a>
                              <button
                                onClick={(e) => copyPhoneNumber(trimmedPhone, e)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Copy phone number"
                              >
                                {copiedPhone === trimmedPhone ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3 text-gray-500 hover:text-blue-600" />
                                )}
                              </button>
                            </div>
                          )
                        })}
                      </>
                    )}
                    {client.hasEmail && client.email && (
                      <a
                        href={`mailto:${client.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100 transition-colors flex-shrink-0"
                        title={client.email}
                      >
                        <MailIcon className="h-3 w-3 flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs">{client.email}</span>
                      </a>
                    )}
                    {client.hasWebsite && client.website && (
                      <a
                        href={`https://${client.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded hover:bg-purple-100 transition-colors flex-shrink-0 truncate max-w-[140px] sm:max-w-none"
                        title={client.website}
                      >
                        <GlobeIcon className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate text-[10px] sm:text-xs">{client.website}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
