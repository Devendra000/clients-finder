"use client"

import { useState, useCallback } from "react"
import { MapPin, Target, Loader2, Plus } from "lucide-react"

interface FetchClientsProps {
  onClientsFetched?: () => void
}

const CATEGORIES = [
  { value: "education.school", label: "Schools" },
  { value: "catering.restaurant", label: "Restaurants" },
  { value: "healthcare.hospital", label: "Hospitals" },
  { value: "healthcare.pharmacy", label: "Pharmacies" },
  { value: "commercial.supermarket", label: "Supermarkets" },
  { value: "service.beauty", label: "Beauty Salons" },
  { value: "entertainment.cinema", label: "Cinemas" },
  { value: "accommodation.hotel", label: "Hotels" },
  { value: "commercial.shopping_mall", label: "Shopping Malls" },
  { value: "sport.fitness", label: "Gyms" },
]

export function FetchClients({ onClientsFetched }: FetchClientsProps) {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [category, setCategory] = useState("education.school")
  const [radius, setRadius] = useState("5000")
  const [limit, setLimit] = useState("50")
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const getUserLocation = useCallback(() => {
    setGettingLocation(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
        setGettingLocation(false)
        setSuccess("Location detected successfully!")
      },
      (error) => {
        setError(`Failed to get location: ${error.message}`)
        setGettingLocation(false)
      }
    )
  }, [])

  const fetchClients = useCallback(async () => {
    if (!location) {
      setError("Please get your location first")
      return
    }

    setFetching(true)
    setError(null)
    setSuccess(null)

    try {
      const params = new URLSearchParams({
        lat: location.lat.toString(),
        lon: location.lon.toString(),
        radius: radius,
        category: category,
        limit: limit,
      })

      const response = await fetch(`/api/clients/search?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch clients from Geoapify")
      }

      const data = await response.json()
      setSuccess(`Successfully fetched and stored ${data.count} clients!`)
      
      if (onClientsFetched) {
        onClientsFetched()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch clients")
    } finally {
      setFetching(false)
    }
  }, [location, radius, category, limit, onClientsFetched])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fetch New Clients</h2>
          <p className="text-gray-600">
            Get your location and fetch potential clients from nearby businesses using Geoapify Places API.
          </p>
        </div>

        {/* Location Detection */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Your Location</h3>
            </div>
            {location && (
              <span className="text-xs text-green-600 font-medium">✓ Detected</span>
            )}
          </div>

          {location ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-700">
                <p>
                  <span className="font-medium">Latitude:</span> {location.lat.toFixed(6)}
                </p>
                <p>
                  <span className="font-medium">Longitude:</span> {location.lon.toFixed(6)}
                </p>
              </div>
              <button
                onClick={getUserLocation}
                disabled={gettingLocation}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Update Location
              </button>
            </div>
          ) : (
            <button
              onClick={getUserLocation}
              disabled={gettingLocation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {gettingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting location...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  Get My Location
                </>
              )}
            </button>
          )}
        </div>

        {/* Fetch Parameters */}
        <div className="space-y-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Business Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-2">
              Search Radius (meters)
            </label>
            <input
              id="radius"
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              min="1000"
              max="50000"
              step="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(parseInt(radius) / 1000).toFixed(1)} km radius
            </p>
          </div>

          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Results
            </label>
            <input
              id="limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              min="10"
              max="100"
              step="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {success}
          </div>
        )}

        {/* Fetch Button */}
        <button
          onClick={fetchClients}
          disabled={!location || fetching}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {fetching ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Fetching clients...
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Fetch Clients from Geoapify
            </>
          )}
        </button>

        {/* Info */}
        <div className="text-xs text-gray-500 border-t pt-4">
          <p>
            This will search for businesses in the selected category within the specified radius and store
            them in your database. Duplicate places will not be added.
          </p>
        </div>
      </div>
    </div>
  )
}
