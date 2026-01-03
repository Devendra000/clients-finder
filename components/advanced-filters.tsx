"use client"

interface AdvancedFiltersProps {
  filters: {
    website: "all" | "has" | "no"
    phone: "all" | "has" | "no"
    email: "all" | "has" | "no"
  }
  onFiltersChange: (filters: {
    website: "all" | "has" | "no"
    phone: "all" | "has" | "no"
    email: "all" | "has" | "no"
  }) => void
  onClearFilters?: () => void
}

export function AdvancedFilters({ filters, onFiltersChange, onClearFilters }: AdvancedFiltersProps) {
  const updateFilter = (key: keyof typeof filters, value: "all" | "has" | "no") => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const hasActiveFilters = filters.website !== "all" || filters.phone !== "all" || filters.email !== "all"

  const FilterGroup = ({ 
    label, 
    filterKey 
  }: { 
    label: string
    filterKey: keyof typeof filters 
  }) => {
    const selected = filters[filterKey]
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 min-w-[70px]">{label}:</span>
        <div className="flex gap-1">
          {(["all", "has", "no"] as const).map((option) => (
            <button
              key={option}
              onClick={() => updateFilter(filterKey, option)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                selected === option
                  ? "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-1"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option === "all" ? "All" : option === "has" ? "✓ Has" : "✗ No"}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">Filters:</span>
          <FilterGroup label="Website" filterKey="website" />
          <FilterGroup label="Phone" filterKey="phone" />
          <FilterGroup label="Email" filterKey="email" />
        </div>
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}
