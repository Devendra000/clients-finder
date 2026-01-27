export enum ClientStatus {
  PENDING = 'PENDING',
  LEAD = 'LEAD',
  REJECTED = 'REJECTED',
  CONTACTED = 'CONTACTED',
  CLOSED = 'CLOSED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface Client {
  id: string
  placeId: string
  name: string
  category?: string
  address: string
  street?: string
  city?: string
  state?: string
  postcode?: string
  country?: string
  countryCode?: string
  phone?: string
  email?: string
  website?: string
  latitude: number
  longitude: number
  status: ClientStatus
  notes?: Note[]
  openingHours?: string
  facilities?: string
  datasource?: string
  createdAt: Date
  updatedAt: Date
  hasWebsite?: boolean
  hasPhone?: boolean
  hasEmail?: boolean
}

export interface Note {
  id: string
  content: string
  clientId: string
  createdAt: Date
  updatedAt: Date
}

export interface FilterOptions {
  category: string
  status: "all" | "active" | "inactive" | "pending" | "ACTIVE" | "INACTIVE" | "PENDING" | "LEAD" | "CONTACTED" | "REJECTED" | "CLOSED"
  website: "all" | "yes" | "no"
  phone: "all" | "yes" | "no"
  email: "all" | "yes" | "no"
}

export interface GeoapifyPlace {
  place_id: string
  name: string
  categories: string[]
  address_line1: string
  address_line2: string
  street: string
  city: string
  state: string
  postcode: string
  country: string
  country_code: string
  lon: number
  lat: number
  formatted: string
  datasource: {
    sourcename: string
    attribution: string
  }
  contact?: {
    phone?: string
    email?: string
    website?: string
  }
  opening_hours?: string
  facilities?: string[]
}

export enum TemplateTargetType {
  ALL = 'ALL',
  HAS_WEBSITE = 'HAS_WEBSITE',
  NO_WEBSITE = 'NO_WEBSITE'
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  targetType: TemplateTargetType
  attachments: string[]
  createdAt: Date
  updatedAt: Date
}
