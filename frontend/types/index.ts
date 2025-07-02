export interface Vehicle {
  _id: string
  name: string
  licensePlate: string
  brand: string
  model: string
  year: number
  color: string
  vin?: string
  deviceId?: string
  status: 'active' | 'inactive' | 'maintenance' | 'stolen'
  lastLocation?: {
    latitude: number
    longitude: number
    speed: number
    timestamp: string
    address?: string
  }
  owner: {
    name: string
    email: string
    phone: string
  }
  alerts: {
    speedLimit: number
    geofence: {
      enabled: boolean
      coordinates: Array<{
        latitude: number
        longitude: number
      }>
    }
  }
  createdAt: string
  updatedAt: string
}

export interface Location {
  _id: string
  vehicleId: string
  latitude: number
  longitude: number
  speed: number
  heading: number
  altitude?: number
  accuracy?: number
  address?: string
  timestamp: string
  source: 'gps' | 'manual' | 'estimated'
  battery?: number
  signal?: number
  alerts?: Array<{
    type: 'speed_limit' | 'geofence_exit' | 'geofence_entry' | 'low_battery' | 'no_signal'
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    timestamp: string
  }>
  createdAt: string
  updatedAt: string
}

export interface LocationUpdate {
  vehicleId: string
  location: {
    latitude: number
    longitude: number
    speed: number
    timestamp: string
  }
  alerts: any[]
}

export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'user'
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  vehicles: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface VehicleStats {
  totalPoints: number
  averageSpeed: number
  maxSpeed: number
  totalDistance: number
  totalTime: number
  startDate: string
  endDate: string
}

export interface RouteData {
  vehicleId: string
  route: Array<{
    lat: number
    lng: number
    speed: number
    timestamp: string
    heading: number
  }>
  totalPoints: number
  startDate: string
  endDate: string
} 