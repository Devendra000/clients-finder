"use client"

import type React from "react"
import { useState } from "react"
import { SearchIcon, MapPinIcon, X } from "lucide-react"

interface SearchBarProps {
  onSearch: (location: string) => void
  isLoading: boolean
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [location, setLocation] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(location)
  }

  const handleClear = () => {
    setLocation("")
    onSearch("")
  }

  return (
    <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <label htmlFor="location" className="block text-xs sm:text-sm font-medium text-foreground mb-1">
            Search Location
          </label>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground pointer-events-none" />
            <input
              id="location"
              type="text"
              placeholder="Enter city, state, or address..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-2.5 text-sm sm:text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
            />
            {location && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-medium py-2 sm:py-2.5 px-4 sm:px-6 text-sm sm:text-base rounded-lg flex items-center justify-center gap-2 transition-colors h-10 sm:h-11"
          >
            <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{isLoading ? "Searching..." : "Search"}</span>
          </button>
        </div>
      </div>
    </form>
  )
}
