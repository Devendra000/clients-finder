"use client"

import { useEffect, useRef } from "react"
import type { Client } from "@/types/client"

interface MapViewProps {
  clients: Client[]
  selectedClient: Client | null
}

export function MapView({ clients, selectedClient }: MapViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!iframeRef.current) return

    // If a client is selected, show that client's location
    if (selectedClient && selectedClient.latitude && selectedClient.longitude) {
      const zoom = 15 // Closer zoom for selected client
      const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${selectedClient.longitude - 0.01},${selectedClient.latitude - 0.01},${selectedClient.longitude + 0.01},${selectedClient.latitude + 0.01}&layer=mapnik&marker=${selectedClient.latitude},${selectedClient.longitude}`
      iframeRef.current.src = mapUrl
      return
    }

    // Otherwise show all clients
    if (clients.length === 0) {
      // Show default map (Nepal)
      const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=80.0,26.0,88.0,30.5&layer=mapnik`
      iframeRef.current.src = mapUrl
      return
    }

    const validClients = clients.filter((c) => c.latitude && c.longitude)
    if (validClients.length === 0) return

    const lats = validClients.map((c) => c.latitude!)
    const lngs = validClients.map((c) => c.longitude!)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    // Add some padding to the bounds
    const latPadding = (maxLat - minLat) * 0.1 || 0.01
    const lngPadding = (maxLng - minLng) * 0.1 || 0.01

    // Use center point with a marker
    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2

    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng - lngPadding},${minLat - latPadding},${maxLng + lngPadding},${maxLat + latPadding}&layer=mapnik&marker=${centerLat},${centerLng}`

    iframeRef.current.src = mapUrl
  }, [clients, selectedClient])

  return (
    <div className="relative w-full h-full">
      {selectedClient && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <h3 className="font-semibold text-gray-900 text-sm">{selectedClient.name}</h3>
          <p className="text-xs text-gray-600 mt-1">{selectedClient.address}</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        style={{ minHeight: "400px" }}
        loading="lazy"
        allowFullScreen
      />
    </div>
  )
}

function getZoomLevel(minLat: number, maxLat: number, minLng: number, maxLng: number): number {
  const latDiff = maxLat - minLat
  const lngDiff = maxLng - minLng
  const maxDiff = Math.max(latDiff, lngDiff)

  if (maxDiff > 10) return 6
  if (maxDiff > 5) return 8
  if (maxDiff > 1) return 10
  if (maxDiff > 0.5) return 12
  return 14
}
