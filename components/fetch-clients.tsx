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
  const [offset, setOffset] = useState(0)
  const [fetching, setFetching] = useState(false)
  const [autoFetching, setAutoFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalFetched, setTotalFetched] = useState(0)
  const [totalNew, setTotalNew] = useState(0)
  const [autoFetchStats, setAutoFetchStats] = useState<any>(null)
  const [autoFetchSingleCategory, setAutoFetchSingleCategory] = useState(false)

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
        // Reset pagination when location changes
        resetPagination()
      },
      (error) => {
        setError(`Failed to get location: ${error.message}`)
        setGettingLocation(false)
      }
    )
  }, [])

  const resetPagination = useCallback(() => {
    setOffset(0)
    setHasMore(true)
    setTotalFetched(0)
    setTotalNew(0)
  }, [])

  const fetchClients = useCallback(async (isInitial = false) => {
    if (!location) {
      setError("Please get your location first")
      return
    }

    setFetching(true)
    setError(null)
    if (isInitial) {
      setSuccess(null)
    }

    try {
      const currentOffset = isInitial ? 0 : offset
      const params = new URLSearchParams({
        lat: location.lat.toString(),
        lon: location.lon.toString(),
        radius: radius,
        category: category,
        limit: limit,
        offset: currentOffset.toString(),
      })

      const response = await fetch(`/api/clients/search?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch clients from Geoapify")
      }

      const data = await response.json()
      
      // Update pagination state
      setHasMore(data.pagination?.hasMore || false)
      setOffset(data.pagination?.nextOffset || currentOffset)
      setTotalFetched(prev => isInitial ? data.count : prev + data.count)
      setTotalNew(prev => isInitial ? data.newCount : prev + data.newCount)
      
      setSuccess(
        `Fetched ${data.count} clients (${data.newCount} new, ${data.existingCount} existing). ` +
        `Total: ${isInitial ? data.count : totalFetched + data.count} fetched, ${isInitial ? data.newCount : totalNew + data.newCount} new.` +
        (data.pagination?.hasMore ? " More results available!" : " No more results.")
      )
      
      if (onClientsFetched) {
        onClientsFetched()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch clients")
    } finally {
      setFetching(false)
    }
  }, [location, radius, category, limit, offset, totalFetched, totalNew, onClientsFetched])

  const startAutoFetch = useCallback(async () => {
    if (!location) {
      setError("Please get your location first")
      return
    }

    setAutoFetching(true)
    setError(null)
    setSuccess(null)
    setAutoFetchStats(null)

    try {
      const response = await fetch("/api/clients/auto-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lon,
          radius: radius,
          batchSize: 100,
          maxBatchesPerCategory: 10,
          category: autoFetchSingleCategory ? category : null
        })
      })

      if (!response.ok) {
        throw new Error("Auto-fetch failed")
      }

      const data = await response.json()
      setAutoFetchStats(data)
      const categoryText = autoFetchSingleCategory 
        ? `for ${CATEGORIES.find(c => c.value === category)?.label || category}`
        : `across ${data.summary.categoriesProcessed} categories`
      setSuccess(
        `🎉 Auto-fetch completed! Found ${data.summary.newClients} NEW clients ` +
        `(${data.summary.totalFetched} total) ${categoryText}!`
      )
      
      if (onClientsFetched) {
        onClientsFetched()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto-fetch failed")
    } finally {
      setAutoFetching(false)
    }
  }, [location, radius, category, autoFetchSingleCategory, onClientsFetched])

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
              onChange={(e) => {
                setCategory(e.target.value)
                resetPagination()
              }}
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
              onChange={(e) => {
                setRadius(e.target.value)
                resetPagination()
              }}
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
              Batch Size (per request)
            </label>
            <input
              id="limit"
              type="number"
              value={limit}
              onChange={(e) => {
                setLimit(e.target.value)
              }}
              min="10"
              max="100"
              step="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Fetch {limit} results per batch. Use "Fetch More" to continue from where you left off.
            </p>
          </div>
        </div>

        {/* Progress Stats */}
        {totalFetched > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-2">Fetching Progress</div>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
              <div>Total Fetched: <span className="font-semibold">{totalFetched}</span></div>
              <div>New Clients: <span className="font-semibold">{totalNew}</span></div>
              <div>Already Exist: <span className="font-semibold">{totalFetched - totalNew}</span></div>
              <div>Next Offset: <span className="font-semibold">{offset}</span></div>
            </div>
          </div>
        )}

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

        {/* Auto-Fetch Stats */}
        {autoFetchStats && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-sm font-bold text-purple-900 mb-3">🎯 Auto-Fetch Results</div>
            <div className="grid grid-cols-2 gap-3 text-sm text-purple-900 mb-3">
              <div className="p-2 bg-white rounded">
                <div className="text-xs text-purple-600">Total Fetched</div>
                <div className="text-lg font-bold">{autoFetchStats.summary.totalFetched}</div>
              </div>
              <div className="p-2 bg-white rounded">
                <div className="text-xs text-purple-600">New Clients</div>
                <div className="text-lg font-bold text-green-600">{autoFetchStats.summary.newClients}</div>
              </div>
            </div>
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold text-purple-800 mb-2">Category Breakdown</summary>
              <div className="space-y-1 mt-2">
                {autoFetchStats.stats.map((stat: any, idx: number) => (
                  <div key={idx} className="flex justify-between p-1 bg-white rounded">
                    <span className="font-medium">{stat.category.split('.').pop()}</span>
                    <span className="text-green-600 font-semibold">{stat.newClients} new</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Auto-Fetch Section */}
        <div className="border-2 border-purple-300 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">⚡</div>
            <div>
              <h3 className="font-bold text-gray-900">AUTO-FETCH ACROSS NEPAL {autoFetchSingleCategory ? '(1 CATEGORY)' : '(ALL CATEGORIES)'}</h3>
              <p className="text-xs text-gray-600">
                {autoFetchSingleCategory 
                  ? `Search 10 cities for ${CATEGORIES.find(c => c.value === category)?.label || category} (~5,000 results)`
                  : 'Search 10 cities across ALL categories (~50,000 results!)'}
              </p>
            </div>
          </div>

          {/* Category Selection Toggle */}
          <div className="mb-3 p-3 bg-white/60 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoFetchSingleCategory}
                onChange={(e) => setAutoFetchSingleCategory(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Only fetch selected category ({CATEGORIES.find(c => c.value === category)?.label})
              </span>
            </label>
          </div>
          
          <button
            onClick={startAutoFetch}
            disabled={!location || autoFetching || fetching}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-lg"
          >
            {autoFetching ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Auto-Fetching... (This may take a few minutes)
              </>
            ) : (
              <>
                <Target className="h-6 w-6" />
                {autoFetchSingleCategory 
                  ? `START AUTO-FETCH (${CATEGORIES.find(c => c.value === category)?.label})` 
                  : 'START AUTO-FETCH ALL CATEGORIES'}
              </>
            )}
          </button>
          
          <div className="mt-3 text-xs text-gray-600 bg-white/60 p-3 rounded">
            <strong>⚡ This will automatically:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {autoFetchSingleCategory ? (
                <>
                  <li>Fetch from <strong>{CATEGORIES.find(c => c.value === category)?.label}</strong> category only</li>
                  <li>Search across <strong>10 major cities</strong> in Nepal (Kathmandu, Pokhara, Lalitpur, etc.)</li>
                  <li>Get up to <strong>500 results per city</strong> = ~5,000 total for this category</li>
                </>
              ) : (
                <>
                  <li>Fetch from <strong>ALL 10 business categories</strong></li>
                  <li>Search across <strong>10 major cities</strong> in Nepal</li>
                  <li>Get up to <strong>500 results per city per category</strong> = ~50,000 total businesses!</li>
                </>
              )}
              <li>25km radius around each city center</li>
              <li>Skip duplicates automatically</li>
              <li>Run in the background ({autoFetchSingleCategory ? '1-3 minutes' : '10-20 minutes'})</li>
            </ul>
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
              <strong>Note:</strong> Geoapify limits 500 results per location, so we search multiple cities to get ALL the data!
            </div>
          </div>
        </div>

        {/* Manual Fetch Section */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-700 mb-3">Manual Fetch (Single Category)</h3>
          <div className="space-y-3">
          <button
            onClick={() => {
              resetPagination()
              fetchClients(true)
            }}
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
                Start Fresh Search
              </>
            )}
          </button>

          {totalFetched > 0 && hasMore && (
            <button
              onClick={() => fetchClients(false)}
              disabled={!location || fetching || !hasMore}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {fetching ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Fetching more...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Fetch Next {limit} Results
                </>
              )}
            </button>
          )}
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 border-t pt-4 space-y-2">
          <p>
            <strong>🚀 Auto-Fetch (Recommended):</strong> Use the purple "AUTO-FETCH" button to automatically search 
            <strong> 10 major cities across Nepal</strong> (Kathmandu, Pokhara, Lalitpur, Biratnagar, Bharatpur, Birgunj, 
            Dharan, Butwal, Hetauda, Janakpur). Gets up to <strong>500 results per city per category</strong> = 
            up to ~50,000 businesses total! Takes 10-20 minutes to complete.
          </p>
          <p>
            <strong>Manual Fetch:</strong> Use "Start Fresh Search" for a single category search from your current location, 
            then click "Fetch Next {limit} Results" to continue fetching more (max 500 per location due to API limits).
          </p>
          <p>
            <strong>Note:</strong> Duplicate places are automatically skipped. Auto-fetch overcomes the 500-result 
            API limit by searching multiple locations!
          </p>
        </div>
      </div>
    </div>
  )
}
