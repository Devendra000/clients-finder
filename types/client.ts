export enum ClientStatus {
  PENDING = 'PENDING',
  LEAD = 'LEAD',
  REJECTED = 'REJECTED',
  CONTACTED = 'CONTACTED',
  CLOSED = 'CLOSED'
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
  openingHours?: string
  facilities?: string
  datasource?: string
  createdAt: Date
  updatedAt: Date
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
