"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { SearchIcon, MapPinIcon } from "lucide-react"

interface SearchBarProps {
  onSearch: (category: string, location: string) => void
  isLoading: boolean
}

const CATEGORIES = [
  "All Categories",
  "Restaurant",
  "Retail",
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Real Estate",
  "Manufacturing",
  "Consulting",
  "Other",
]

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [category, setCategory] = useState("All Categories")
  const [location, setLocation] = useState("")
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Fetch location suggestions from Geoapify
  useEffect(() => {
    if (location.length < 2) {
      setLocationSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(location)}&limit=5&apiKey=YOUR_GEOAPIFY_API_KEY`,
        )
        const data = await response.json()

        const suggestions = data.results?.map((result: any) => result.formatted) || []
        setLocationSuggestions(suggestions)
        setShowSuggestions(true)
      } catch (error) {
        console.error("Error fetching location suggestions:", error)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [location])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(category, location)
  }

  const handleLocationSelect = (selected: string) => {
    setLocation(selected)
    setShowSuggestions(false)
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3">
        {/* Category Dropdown */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location Input with Autocomplete */}
        <div className="relative">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              id="location"
              type="text"
              placeholder="Enter city or address..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => location.length > 1 && setShowSuggestions(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Location Suggestions Dropdown */}
            {showSuggestions && locationSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10"
              >
                {locationSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleLocationSelect(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-900 text-sm first:rounded-t-lg last:rounded-b-lg"
                  >
                    <MapPinIcon className="inline h-4 w-4 mr-2 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isLoading || !location.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <SearchIcon className="h-5 w-5" />
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
    </form>
  )
}
