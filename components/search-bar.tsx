"use client"

import type React from "react"

import { useState } from "react"
import { SearchIcon, X } from "lucide-react"

interface SearchBarProps {
  onSearch: (searchQuery: string) => void
  isLoading: boolean
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleClear = () => {
    setSearchQuery("")
    onSearch("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    // Auto-search when cleared
    if (value.length === 0) {
      onSearch("")
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search clients by name, category, location, phone, email..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <SearchIcon className="h-5 w-5" />
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  )
}
