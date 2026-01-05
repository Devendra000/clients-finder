"use client"
import type { FilterOptions } from "@/types/client"

interface FilterPanelProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  categories: string[]
}

// Helper to format category labels
const formatCategoryLabel = (category: string) => {
  // If it's a Geoapify category (e.g., "education.school"), format it nicely
  if (category.includes('.')) {
    const parts = category.split('.')
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' - ')
  }
  // Otherwise just capitalize
  return category.charAt(0).toUpperCase() + category.slice(1)
}

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Lead", value: "LEAD" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Closed", value: "CLOSED" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
]

const CONTACT_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
]

export function FilterPanel({ filters, onFilterChange, categories }: FilterPanelProps) {
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {formatCategoryLabel(cat)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Methods</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Website</label>
            <div className="flex gap-2">
              {CONTACT_OPTIONS.map((opt) => (
                <button
                  key={`website-${opt.value}`}
                  onClick={() => handleFilterChange("website", opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filters.website === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Phone</label>
            <div className="flex gap-2">
              {CONTACT_OPTIONS.map((opt) => (
                <button
                  key={`phone-${opt.value}`}
                  onClick={() => handleFilterChange("phone", opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filters.phone === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Email</label>
            <div className="flex gap-2">
              {CONTACT_OPTIONS.map((opt) => (
                <button
                  key={`email-${opt.value}`}
                  onClick={() => handleFilterChange("email", opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filters.email === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
