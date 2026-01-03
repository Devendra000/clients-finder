export interface Client {
  id: string
  name: string
  category: string
  address: string
  phone?: string
  email?: string
  website?: string
  latitude: number
  longitude: number
  createdAt: Date
}
