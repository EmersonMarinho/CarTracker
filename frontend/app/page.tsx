'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { Car, MapPin, Clock, Gauge, Navigation, AlertTriangle, Battery, Signal } from 'lucide-react'
import toast from 'react-hot-toast'
import { io, Socket } from 'socket.io-client'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Vehicle } from '../types'

const GoogleCarMap = dynamic(() => import('../components/GoogleCarMap'), { ssr: false })

// Tipos
interface LocationUpdate {
  vehicleId: string
  location: {
    latitude: number
    longitude: number
    speed: number
    timestamp: string
  }
  alerts: any[]
}

// Usuários simulados
const USERS = [
  { id: 1, name: 'João Silva', email: 'joao@email.com', password: '1234', city: 'São Paulo' },
  { id: 2, name: 'Maria Souza', email: 'maria@email.com', password: '1234', city: 'Curitiba' },
]

// Veículos simulados
const MOCK_VEHICLES: Vehicle[] = [
  {
    _id: '1',
    name: 'Carro Alpha',
    licensePlate: 'ABC1234',
    brand: 'Toyota',
    model: 'Corolla',
    status: 'active',
    year: 2022,
    color: 'Prata',
    owner: { name: 'João Silva', email: 'joao@email.com', phone: '11999999999' },
    lastLocation: { latitude: -23.561684, longitude: -46.655981, speed: 60, timestamp: new Date().toISOString() },
    alerts: { speedLimit: 80, geofence: { enabled: false, coordinates: [] } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'Carro Beta',
    licensePlate: 'XYZ5678',
    brand: 'Honda',
    model: 'Civic',
    status: 'inactive',
    year: 2021,
    color: 'Preto',
    owner: { name: 'João Silva', email: 'joao@email.com', phone: '11999999999' },
    lastLocation: { latitude: -23.560600, longitude: -46.651100, speed: 0, timestamp: new Date().toISOString() },
    alerts: { speedLimit: 80, geofence: { enabled: false, coordinates: [] } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Usuário 2 - Curitiba
  {
    _id: '3',
    name: 'Carro Gamma',
    licensePlate: 'DEF4321',
    brand: 'Ford',
    model: 'Ka',
    status: 'active',
    year: 2020,
    color: 'Branco',
    owner: { name: 'Maria Souza', email: 'maria@email.com', phone: '11888888888' },
    lastLocation: { latitude: -25.4284, longitude: -49.2733, speed: 30, timestamp: new Date().toISOString() },
    alerts: { speedLimit: 80, geofence: { enabled: false, coordinates: [] } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Van escolar em Curitiba
  {
    _id: '4',
    name: 'Van Escolar Curitiba',
    licensePlate: 'VAN2024',
    brand: 'Mercedes-Benz',
    model: 'Sprinter',
    status: 'active',
    year: 2023,
    color: 'Amarela',
    owner: { name: 'Maria Souza', email: 'maria@email.com', phone: '11888888888' },
    lastLocation: { latitude: -25.4300, longitude: -49.2650, speed: 40, timestamp: new Date().toISOString() },
    alerts: { speedLimit: 80, geofence: { enabled: false, coordinates: [] } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Mais carros de Curitiba
  {
    _id: '5',
    name: 'Carro Delta',
    licensePlate: 'CUR1001',
    brand: 'Chevrolet',
    model: 'Onix',
    status: 'inactive',
    year: 2019,
    color: 'Prata',
    owner: { name: 'Maria Souza', email: 'maria@email.com', phone: '11888888888' },
    lastLocation: { latitude: -25.4290, longitude: -49.2710, speed: 0, timestamp: new Date().toISOString() },
    alerts: { speedLimit: 80, geofence: { enabled: false, coordinates: [] } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '6',
    name: 'Carro Epsilon',
    licensePlate: 'CUR1002',
    brand: 'Volkswagen',
    model: 'Gol',
    status: 'active',
    year: 2018,
    color: 'Vermelho',
    owner: { name: 'Maria Souza', email: 'maria@email.com', phone: '11888888888' },
    lastLocation: { latitude: -25.4270, longitude: -49.2700, speed: 50, timestamp: new Date().toISOString() },
    alerts: { speedLimit: 80, geofence: { enabled: false, coordinates: [] } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '7',
    name: 'Carro Zeta',
    licensePlate: 'CUR1003',
    brand: 'Fiat',
    model: 'Uno',
    status: 'inactive',
    year: 2017,
    color: 'Azul',
    owner: { name: 'Maria Souza', email: 'maria@email.com', phone: '11888888888' },
    lastLocation: { latitude: -25.4310, longitude: -49.2720, speed: 0, timestamp: new Date().toISOString() },
    alerts: { speedLimit: 80, geofence: { enabled: false, coordinates: [] } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '8',
    name: 'Carro Theta',
    licensePlate: 'CUR1004',
    brand: 'Renault',
    model: 'Sandero',
    status: 'active',
    year: 2021,
    color: 'Branco',
    owner: { name: 'Maria Souza', email: 'maria@email.com', phone: '11888888888' },
    lastLocation: { latitude: -25.4320, longitude: -49.2680, speed: 35, timestamp: new Date().toISOString() },
    alerts: { speedLimit: 80, geofence: { enabled: false, coordinates: [] } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '9',
    name: 'Carro Iota',
    licensePlate: 'CUR1005',
    brand: 'Hyundai',
    model: 'HB20',
    status: 'inactive',
    year: 2020,
    color: 'Cinza',
    owner: { name: 'Maria Souza', email: 'maria@email.com', phone: '11888888888' },
    lastLocation: { latitude: -25.4330, longitude: -49.2670, speed: 0, timestamp: new Date().toISOString() },
    alerts: { speedLimit: 80, geofence: { enabled: false, coordinates: [] } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '10',
    name: 'Carro Kappa',
    licensePlate: 'CUR1006',
    brand: 'Peugeot',
    model: '208',
    status: 'active',
    year: 2022,
    color: 'Preto',
    owner: { name: 'Maria Souza', email: 'maria@email.com', phone: '11888888888' },
    lastLocation: { latitude: -25.4340, longitude: -49.2660, speed: 60, timestamp: new Date().toISOString() },
    alerts: { speedLimit: 80, geofence: { enabled: false, coordinates: [] } },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
]

// Componente para atualizar o mapa quando receber novas localizações
function MapUpdater({ socket, vehicles }: { socket: Socket | null, vehicles: Vehicle[] }) {
  const map = useMap()

  useEffect(() => {
    if (!socket) return

    const handleLocationUpdate = (data: LocationUpdate) => {
      const vehicle = vehicles.find(v => v._id === data.vehicleId)
      if (vehicle) {
        map.setView([data.location.latitude, data.location.longitude], map.getZoom())
        
        if (data.alerts.length > 0) {
          toast.error(`Alerta: ${data.alerts[0].message}`)
        }
      }
    }

    socket.on('location_update', handleLocationUpdate)

    return () => {
      socket.off('location_update', handleLocationUpdate)
    }
  }, [socket, vehicles, map])

  return null
}

// Ícone personalizado para o marcador do carro
const carIcon = new Icon({
  iconUrl: '/car-marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})

export default function Dashboard() {
  // Login simulado
  const [currentUser, setCurrentUser] = useState<typeof USERS[0] | null>(USERS[0])
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES)
  const [modalVehicle, setModalVehicle] = useState<Vehicle | null>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  // Filtrar veículos do usuário logado
  const userVehicles = vehicles.filter(v => {
    if (currentUser?.id === 1) return v.owner.email === 'joao@email.com';
    if (currentUser?.id === 2) return v.owner.email === 'maria@email.com';
    return false;
  });

  // Login handler
  function handleLogin(e: { preventDefault: () => void }) {
    e.preventDefault()
    setLoading(true)
    const user = USERS.find(u => u.email === loginForm.email && u.password === loginForm.password)
    setTimeout(() => {
      setLoading(false)
      if (user) {
        setCurrentUser(user)
        toast.success('Login realizado!')
      } else {
        toast.error('Usuário ou senha inválidos')
      }
    }, 800)
  }

  // Denunciar roubo
  function handleReportTheft(vehicleId: string) {
    setVehicles(vehicles => vehicles.map(v =>
      v._id === vehicleId ? { ...v, status: 'stolen' } : v
    ))
    toast('🚨 Roubo denunciado! Polícia acionada.', { icon: '🚨' })
    setModalVehicle(null)
  }

  // Se não logado, mostra tela de login
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow w-full max-w-sm">
          <h2 className="text-xl font-bold mb-6 text-center">Escolha uma conta</h2>
          <div className="space-y-4">
            {USERS.map(user => (
              <button
                key={user.id}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 hover:bg-primary-50 transition"
                onClick={() => setCurrentUser(user)}
              >
                <div>
                  <div className="font-semibold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700 border border-gray-200">{user.city}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 gap-2 sm:gap-0">
          <div className="flex items-center">
            <span className="font-bold text-primary-600 text-lg mr-2">Car Tracker</span>
            <span className="text-gray-500">Bem-vindo, {currentUser.name}</span>
          </div>
          <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow transition w-full sm:w-auto" onClick={() => setCurrentUser(null)}>Sair</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4 sm:p-6 mb-4 lg:mb-0">
              <h2 className="text-lg font-semibold mb-4">Seus Veículos</h2>
              <div className="space-y-3">
                {userVehicles.map(vehicle => (
                  <div
                    key={vehicle._id}
                    onClick={() => setModalVehicle(vehicle)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${modalVehicle?._id === vehicle._id ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 text-base">{vehicle.name}</h3>
                      <p className="text-xs text-gray-500">{vehicle.licensePlate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        vehicle.status === 'active' ? 'bg-green-100 text-green-700' :
                        vehicle.status === 'inactive' ? 'bg-yellow-100 text-yellow-700' :
                        vehicle.status === 'stolen' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{vehicle.status}</span>
                      <button
                        className={`text-xs px-2 py-1 rounded border ${selectedVehicleId === vehicle._id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'} transition`}
                        onClick={e => { e.stopPropagation(); setSelectedVehicleId(selectedVehicleId === vehicle._id ? null : vehicle._id); }}
                      >
                        {selectedVehicleId === vehicle._id ? 'Parar de seguir' : 'Seguir'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 flex flex-col gap-4 lg:gap-6">
            {/* Cards de resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-2">
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                <span className="text-xs text-gray-400 mb-1">Total</span>
                <span className="text-2xl font-bold text-gray-900">{userVehicles.length}</span>
              </div>
              <div className="bg-green-50 rounded-lg shadow p-4 flex flex-col items-center">
                <span className="text-xs text-green-700 mb-1">Ativos</span>
                <span className="text-2xl font-bold text-green-700">{userVehicles.filter(v => v.status === 'active').length}</span>
              </div>
              <div className="bg-yellow-50 rounded-lg shadow p-4 flex flex-col items-center">
                <span className="text-xs text-yellow-700 mb-1">Inativos</span>
                <span className="text-2xl font-bold text-yellow-700">{userVehicles.filter(v => v.status === 'inactive').length}</span>
              </div>
              <div className="bg-red-50 rounded-lg shadow p-4 flex flex-col items-center">
                <span className="text-xs text-red-700 mb-1">Roubados</span>
                <span className="text-2xl font-bold text-red-700">{userVehicles.filter(v => v.status === 'stolen').length}</span>
              </div>
            </div>

            {/* Mapa */}
            <div className="card p-2 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <h2 className="text-lg font-semibold">Mapa de Rastreamento</h2>
                <div className="text-sm text-gray-500">
                  {userVehicles.length === 1 ? `Rastreando: ${userVehicles[0].name}` : 'Clique em um carro para detalhes'}
                </div>
              </div>
              <div className="h-64 sm:h-96 rounded-lg overflow-hidden shadow">
                <GoogleCarMap vehicles={userVehicles} onMarkerClick={setModalVehicle} selectedVehicleId={selectedVehicleId} />
              </div>
            </div>

            {/* Alertas recentes simulados */}
            <div className="card p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">Alertas Recentes</h2>
              <ul className="divide-y divide-gray-100">
                {userVehicles.map(v => v.status === 'stolen' && (
                  <li key={v._id} className="py-2 flex items-center gap-2 text-red-700">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                    {v.name} ({v.licensePlate}): <span className="font-semibold">Roubo denunciado</span>
                  </li>
                ))}
                {userVehicles.map(v => v.status === 'active' && (
                  <li key={v._id} className="py-2 flex items-center gap-2 text-green-700">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    {v.name} ({v.licensePlate}): <span className="font-semibold">Em movimento</span>
                  </li>
                ))}
                {userVehicles.map(v => v.status === 'inactive' && (
                  <li key={v._id} className="py-2 flex items-center gap-2 text-yellow-700">
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
                    {v.name} ({v.licensePlate}): <span className="font-semibold">Parado</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal de detalhes do carro */}
            {modalVehicle && (
              <Modal onClose={() => setModalVehicle(null)}>
                <div className="flex flex-col items-center p-8">
                  <div className="w-28 h-28 rounded-xl bg-white shadow flex items-center justify-center mb-4">
                    <img src={modalVehicle.name.toLowerCase().includes('van') ? '/van-marker.svg' : '/car-marker.svg'} alt="Carro" className="w-20 h-20 object-contain" />
                  </div>
                  <h2 className="text-2xl font-bold mb-1 text-gray-900">{modalVehicle.name}</h2>
                  <p className="text-gray-400 text-sm mb-4">Proprietário: {modalVehicle.owner.name}</p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm w-full max-w-xs mb-4">
                    <div><span className="text-gray-400">Placa:</span> <span className="font-semibold text-gray-900">{modalVehicle.licensePlate}</span></div>
                    <div><span className="text-gray-400">Marca:</span> <span className="font-semibold text-gray-900">{modalVehicle.brand}</span></div>
                    <div><span className="text-gray-400">Modelo:</span> <span className="font-semibold text-gray-900">{modalVehicle.model}</span></div>
                    <div><span className="text-gray-400">Ano:</span> <span className="font-semibold text-gray-900">{modalVehicle.year}</span></div>
                    <div><span className="text-gray-400">Cor:</span> <span className="font-semibold text-gray-900">{modalVehicle.color}</span></div>
                    <div><span className="text-gray-400">Status:</span> <span className="font-semibold text-gray-900 capitalize">{modalVehicle.status}</span></div>
                    <div className="col-span-2"><span className="text-gray-400">Velocidade:</span> <span className="font-semibold text-gray-900">{modalVehicle.lastLocation?.speed || 0} km/h</span></div>
                  </div>
                  {/* Simulação de KM rodados nas últimas 24h */}
                  <div className="w-full max-w-xs mb-6 text-center">
                    <span className="text-gray-400 text-xs">Rodou nas últimas 24h:</span>
                    <span className="ml-2 font-semibold text-base text-primary-700">{(Math.random() * 30 + 5).toFixed(1)} km</span>
                  </div>
                  <button
                    className={`w-full py-3 rounded-lg font-semibold text-white transition text-base shadow-sm mt-2 ${modalVehicle.status === 'stolen' ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                    onClick={() => handleReportTheft(modalVehicle._id)}
                    disabled={modalVehicle.status === 'stolen'}
                  >
                    {modalVehicle.status === 'stolen' ? 'Roubo já denunciado' : 'Denunciar roubo'}
                  </button>
                </div>
              </Modal>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal component
function Modal({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative p-0">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors z-10 text-xl font-bold"
        >×</button>
        {children}
      </div>
    </div>
  )
} 