import L from 'leaflet'

// Fix para ícones do Leaflet no Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Ícone personalizado para carros
export const carIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI0IDEySDI4TDI2IDhIMjJMMjQgMTJaIiBmaWxsPSIjM0I4MkY2Ii8+CjxwYXRoIGQ9Ik04IDEySDEyTDEwIDhINkw4IDEyWiIgZmlsbD0iIzNCODJGNiIvPgo8cGF0aCBkPSJNMjYgMjBIMjJMMjAgMjRIMTJMMTAgMjBINiIgZmlsbD0iIzNCODJGNiIvPgo8cGF0aCBkPSJNMjggMTJWMjBIMjZMMjQgMjRIMThMMTYgMjBIMTRWMTJIMjhWIiBmaWxsPSIjM0I4MkY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkgyMFYxOEgxMlYxNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})

// Configurações padrão do mapa
export const mapConfig = {
  center: [-23.5505, -46.6333], // São Paulo
  zoom: 13,
  minZoom: 3,
  maxZoom: 18
} 