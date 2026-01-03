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
    if (!iframeRef.current || clients.length === 0) return

    // Calculate bounds from client locations
    const validClients = clients.filter((c) => c.latitude && c.longitude)
    if (validClients.length === 0) return

    const lats = validClients.map((c) => c.latitude!)
    const lngs = validClients.map((c) => c.longitude!)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2
    const zoom = getZoomLevel(minLat, maxLat, minLng, maxLng)

    // Build markers for URL
    const markers = validClients
      .map((client) => {
        const isSelected = selectedClient?.id === client.id
        const color = isSelected ? "0066cc" : "6b7280"
        return `${client.latitude},${client.longitude},${color}`
      })
      .join("/")

    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${markers}`

    iframeRef.current.src = mapUrl
  }, [clients, selectedClient])

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0"
      style={{ minHeight: "400px" }}
      loading="lazy"
      allowFullScreen
    />
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
