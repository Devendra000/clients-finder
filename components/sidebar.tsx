"use client"

import { useState } from "react"
import { Database, Search, Plus, MapPin } from "lucide-react"

interface SidebarProps {
  currentView: "clients" | "fetch"
  onViewChange: (view: "clients" | "fetch") => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-400" />
          <h1 className="text-xl font-bold">Clients Finder</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <button
            onClick={() => onViewChange("clients")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === "clients"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <Search className="h-5 w-5" />
            <span className="font-medium">My Clients</span>
          </button>

          <button
            onClick={() => onViewChange("fetch")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === "fetch"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Fetch New Clients</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <p>Powered by Geoapify</p>
      </div>
    </aside>
  )
}
