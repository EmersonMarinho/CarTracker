const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Função para criar um veículo de teste
async function createTestVehicle() {
  try {
    const vehicleData = {
      name: 'Carro Teste',
      licensePlate: 'ABC1234',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      color: 'Prata',
      vin: '1HGBH41JXMN109186',
      deviceId: 'GPS001',
      owner: {
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '(11) 99999-9999'
      },
      alerts: {
        speedLimit: 80,
        geofence: {
          enabled: false,
          coordinates: []
        }
      }
    };

    const response = await axios.post(`${API_BASE_URL}/vehicles`, vehicleData);
    console.log('✅ Veículo criado:', response.data);
    return response.data._id;
  } catch (error) {
    console.error('❌ Erro ao criar veículo:', error.response?.data || error.message);
    return null;
  }
}

// Função para simular dados de GPS
async function simulateGPSData(vehicleId) {
  try {
    const locationData = {
      vehicleId,
      latitude: -23.5505 + (Math.random() - 0.5) * 0.01, // Variação em São Paulo
      longitude: -46.6333 + (Math.random() - 0.5) * 0.01,
      speed: Math.floor(Math.random() * 60) + 20, // 20-80 km/h
      heading: Math.floor(Math.random() * 360),
      altitude: 800 + Math.random() * 200,
      accuracy: 5 + Math.random() * 10,
      battery: 50 + Math.random() * 50,
      signal: 60 + Math.random() * 40,
      timestamp: new Date().toISOString()
    };

    const response = await axios.post(`${API_BASE_URL}/location`, locationData);
    console.log('📍 Dados GPS enviados:', {
      speed: locationData.speed,
      battery: Math.round(locationData.battery),
      signal: Math.round(locationData.signal)
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao enviar dados GPS:', error.response?.data || error.message);
  }
}

// Função para listar veículos
async function listVehicles() {
  try {
    const response = await axios.get(`${API_BASE_URL}/vehicles`);
    console.log('🚗 Veículos cadastrados:', response.data.vehicles.length);
    return response.data.vehicles;
  } catch (error) {
    console.error('❌ Erro ao listar veículos:', error.response?.data || error.message);
    return [];
  }
}

// Função para obter estatísticas
async function getVehicleStats(vehicleId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/location/stats/${vehicleId}`);
    console.log('📊 Estatísticas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error.response?.data || error.message);
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando testes da API...\n');

  // Verificar se o servidor está rodando
  try {
    await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Servidor está rodando\n');
  } catch (error) {
    console.error('❌ Servidor não está rodando. Execute: npm run dev:backend');
    return;
  }

  // Listar veículos existentes
  let vehicles = await listVehicles();
  
  // Se não houver veículos, criar um
  let vehicleId;
  if (vehicles.length === 0) {
    console.log('📝 Criando veículo de teste...');
    vehicleId = await createTestVehicle();
  } else {
    vehicleId = vehicles[0]._id;
    console.log(`📝 Usando veículo existente: ${vehicles[0].name}`);
  }

  if (!vehicleId) {
    console.error('❌ Não foi possível obter um veículo para teste');
    return;
  }

  // Simular envio de dados GPS por 30 segundos
  console.log('\n🔄 Simulando dados GPS por 30 segundos...');
  console.log('Pressione Ctrl+C para parar\n');

  let count = 0;
  const interval = setInterval(async () => {
    count++;
    await simulateGPSData(vehicleId);
    
    if (count % 10 === 0) {
      await getVehicleStats(vehicleId);
    }
  }, 3000); // Enviar dados a cada 3 segundos

  // Parar após 30 segundos
  setTimeout(() => {
    clearInterval(interval);
    console.log('\n✅ Teste concluído!');
    console.log('Acesse http://localhost:3000 para ver o dashboard');
  }, 30000);
}

// Executar se for chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createTestVehicle,
  simulateGPSData,
  listVehicles,
  getVehicleStats
}; 