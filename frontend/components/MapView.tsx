'use client'
import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { carIcon } from '../lib/leaflet-config'
import { Gauge, Clock } from 'lucide-react'
import { Vehicle } from '../types'

interface MapViewProps {
  vehicles: Vehicle[]
  onMarkerClick: (v: Vehicle) => void
}

export default function MapView({ vehicles, onMarkerClick }: MapViewProps) {
  const center = vehicles.length > 0 && vehicles[0].lastLocation
    ? [vehicles[0].lastLocation.latitude, vehicles[0].lastLocation.longitude]
    : [-23.5505, -46.6333]

  return (
    <MapContainer
      center={center as [number, number]}
      zoom={13}
      className="w-full h-full rounded-lg shadow"
      style={{ minHeight: '100%', minWidth: '100%' }}
      scrollWheelZoom={true}
      attributionControl={false}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='' // Remove attribution visual
      />
      {vehicles.map((vehicle) => {
        if (!vehicle.lastLocation) return null
        return (
          <Marker
            key={vehicle._id}
            position={[vehicle.lastLocation.latitude, vehicle.lastLocation.longitude]}
            icon={carIcon}
            eventHandlers={{ click: () => onMarkerClick(vehicle) }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{vehicle.name}</h3>
                <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                <p className="text-sm">
                  <Gauge className="inline h-3 w-3 mr-1" />
                  {vehicle.lastLocation.speed} km/h
                </p>
                <p className="text-sm">
                  <Clock className="inline h-3 w-3 mr-1" />
                  {new Date(vehicle.lastLocation.timestamp).toLocaleString()}
                </p>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
} 