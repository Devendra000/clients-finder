"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { TemplateManager } from '@/components/template-manager'

export default function TemplatesPage() {
  const router = useRouter()
  const [currentView] = useState<"clients" | "fetch" | "templates">("templates")

  const handleViewChange = (view: "clients" | "fetch" | "templates") => {
    if (view === "clients") {
      router.push("/")
    } else if (view === "fetch") {
      router.push("/?view=fetch")
    }
    // templates stays on current page
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      <div className="flex-1 overflow-hidden">
        <TemplateManager />
      </div>
    </div>
  )
}