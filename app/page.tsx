import { ClientFinderApp } from "@/components/client-finder"

export const metadata = {
  title: "Clients Finder - Search & Discover Local Businesses",
  description:
    "Find and connect with businesses by category and location. Browse detailed client information on an interactive map.",
}

export default function Home() {
  return <ClientFinderApp />
}
