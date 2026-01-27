import { notFound } from "next/navigation"
import { ClientDetailPage } from "@/components/client-detail-page"
import { Sidebar } from "@/components/sidebar"

interface PageProps {
  params: Promise<{ id: string }>
}

async function getClient(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:7000'
  
  try {
    const response = await fetch(`${baseUrl}/api/clients/${id}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.client || data
  } catch (error) {
    console.error('Error fetching client:', error)
    return null
  }
}

export default async function ClientPage({ params }: PageProps) {
  const { id } = await params
  const client = await getClient(id)

  if (!client) {
    notFound()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentView="clients"
        onViewChange={(view) => {
          if (view === "clients") {
            window.location.href = "/"
          } else if (view === "fetch") {
            window.location.href = "/?view=fetch"
          } else if (view === "templates") {
            window.location.href = "/?view=templates"
          }
        }}
      />
      <div className="flex-1 overflow-hidden">
        <ClientDetailPage client={client} />
      </div>
    </div>
  )
}
