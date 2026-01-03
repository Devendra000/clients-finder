"use client"

import { ClientStatus } from "@/types/client"

interface StatusFilterProps {
  selectedStatus: ClientStatus | "ALL"
  onStatusChange: (status: ClientStatus | "ALL") => void
}

const statusOptions = [
  { value: "ALL" as const, label: "All Clients", color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
  { value: ClientStatus.PENDING, label: "Pending", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
  { value: ClientStatus.LEAD, label: "Leads", color: "bg-green-100 text-green-800 hover:bg-green-200" },
  { value: ClientStatus.CONTACTED, label: "Contacted", color: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
  { value: ClientStatus.REJECTED, label: "Rejected", color: "bg-red-100 text-red-800 hover:bg-red-200" },
  { value: ClientStatus.CLOSED, label: "Closed", color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
]

export function StatusFilter({ selectedStatus, onStatusChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-1.5 lg:gap-2 flex-wrap">
      <span className="text-xs lg:text-sm font-medium text-gray-700 hidden sm:inline">Status:</span>
      {statusOptions.map((status) => (
        <button
          key={status.value}
          onClick={() => onStatusChange(status.value)}
          className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all ${
            selectedStatus === status.value
              ? status.color + " ring-2 ring-offset-1 ring-gray-400"
              : status.color + " opacity-60"
          }`}
        >
          {status.label}
        </button>
      ))}
    </div>
  )
}
