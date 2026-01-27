"use client"

import { useState } from "react"
import { Database, Search, Plus, MapPin, FileText } from "lucide-react"

interface SidebarProps {
  currentView: "clients" | "fetch" | "templates"
  onViewChange: (view: "clients" | "fetch" | "templates") => void
  isMobileMenuOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ currentView, onViewChange, isMobileMenuOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-gray-900 text-white flex flex-col
        fixed lg:relative inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
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

          <button
            onClick={() => onViewChange("templates")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === "templates"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="font-medium">Email Templates</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <p>Powered by Geoapify</p>
      </div>
    </aside>
    </>
  )
}
