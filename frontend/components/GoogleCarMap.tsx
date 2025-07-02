import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useRef, useState } from 'react';
import { Vehicle } from '../types';
import toast from 'react-hot-toast';

const containerStyle = {
  width: '100%',
  height: '100%'
};

interface GoogleCarMapProps {
  vehicles: Vehicle[];
  onMarkerClick: (vehicle: Vehicle) => void;
  selectedVehicleId?: string | null;
}

function getNextPosition(lat: number, lng: number, step: number) {
  const radius = 0.0005;
  const angle = (step % 360) * (Math.PI / 180);
  return {
    lat: lat + Math.cos(angle) * radius,
    lng: lng + Math.sin(angle) * radius,
  };
}

export default function GoogleCarMap({ vehicles, onMarkerClick, selectedVehicleId }: GoogleCarMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [center, setCenter] = useState(() => {
    if (selectedVehicleId) {
      const v = vehicles.find(v => v._id === selectedVehicleId && v.lastLocation);
      if (v && v.lastLocation) {
        return { lat: v.lastLocation.latitude, lng: v.lastLocation.longitude };
      }
    }
    if (vehicles.length > 0 && vehicles[0].lastLocation) {
      return { lat: vehicles[0].lastLocation.latitude, lng: vehicles[0].lastLocation.longitude };
    }
    return { lat: -23.561684, lng: -46.655981 };
  });

  // Ícone SVG local
  const carIcon = isLoaded && window.google ? {
    url: '/car-marker.svg',
    scaledSize: new window.google.maps.Size(40, 40)
  } : undefined;
  const vanIcon = isLoaded && window.google ? {
    url: '/van-marker.svg',
    scaledSize: new window.google.maps.Size(40, 40)
  } : undefined;

  const animatedPositions = useRef<{ [id: string]: { lat: number, lng: number } }>({});
  const [step, setStep] = useState(0);

  useEffect(() => {
    vehicles.forEach(v => {
      if ((v.status === 'active' || v.status === 'stolen') && v.lastLocation && !animatedPositions.current[v._id]) {
        animatedPositions.current[v._id] = {
          lat: v.lastLocation.latitude,
          lng: v.lastLocation.longitude
        };
      }
    });
  }, [vehicles]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => s + 5);
      vehicles.forEach(v => {
        if ((v.status === 'active' || v.status === 'stolen') && v.lastLocation) {
          const prev = animatedPositions.current[v._id] || { lat: v.lastLocation.latitude, lng: v.lastLocation.longitude };
          const next = getNextPosition(prev.lat, prev.lng, step + 5);
          animatedPositions.current[v._id] = next;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [vehicles, step]);

  // Centralizar e seguir veículo selecionado
  useEffect(() => {
    if (!selectedVehicleId || !isLoaded || !mapRef.current) return;
    const v = vehicles.find(v => v._id === selectedVehicleId && v.lastLocation);
    if (v && v.lastLocation) {
      const pos =
        (['active', 'stolen'].includes(v.status) && animatedPositions.current[v._id])
          ? animatedPositions.current[v._id]
          : { lat: v.lastLocation.latitude, lng: v.lastLocation.longitude };
      setCenter(pos);
      mapRef.current.panTo(pos);
    }
  }, [selectedVehicleId, vehicles, step, isLoaded]);

  if (!isLoaded) return <div>Carregando mapa...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={16}
      onLoad={map => { mapRef.current = map; }}
    >
      {vehicles.map(vehicle => {
        if (!vehicle.lastLocation) return null;
        const pos =
          (['active', 'stolen'].includes(vehicle.status) && animatedPositions.current[vehicle._id])
            ? animatedPositions.current[vehicle._id]
            : { lat: vehicle.lastLocation.latitude, lng: vehicle.lastLocation.longitude };
        // Se for van, usa vanIcon; se roubado, marcador vermelho; senão carIcon
        const isVan = vehicle.name.toLowerCase().includes('van');
        const icon = isVan ? vanIcon : (vehicle.status === 'stolen' ? {
          url: '/car-marker.svg',
          scaledSize: isLoaded && window.google ? new window.google.maps.Size(40, 40) : undefined,
        } : carIcon);
        return (
          <Marker
            key={vehicle._id}
            position={pos}
            icon={icon}
            title={vehicle.name}
            onClick={() => onMarkerClick(vehicle)}
          />
        );
      })}
    </GoogleMap>
  );
} 