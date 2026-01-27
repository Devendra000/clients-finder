"use client"

import { Sidebar } from "@/components/sidebar"
import { ClientDetailPage } from "@/components/client-detail-page"
import type { Client } from "@/types/client"

interface ClientDetailPageWrapperProps {
  client: Client
}

export function ClientDetailPageWrapper({ client }: ClientDetailPageWrapperProps) {
  const handleViewChange = (view: "clients" | "fetch" | "templates") => {
    if (view === "clients") {
      window.location.href = "/"
    } else if (view === "fetch") {
      window.location.href = "/?view=fetch"
    } else if (view === "templates") {
      window.location.href = "/templates"
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentView="clients"
        onViewChange={handleViewChange}
      />
      <div className="flex-1 overflow-auto">
        <ClientDetailPage client={client} />
      </div>
    </div>
  )
}
