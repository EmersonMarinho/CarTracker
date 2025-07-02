const express = require('express');
const Vehicle = require('../models/Vehicle');
const Location = require('../models/Location');
const router = express.Router();

// POST /api/location - Receber dados de GPS do dispositivo
router.post('/', async (req, res) => {
  try {
    const { vehicleId, latitude, longitude, speed, heading, altitude, accuracy, battery, signal, timestamp } = req.body;

    // Validar dados obrigatórios
    if (!vehicleId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        error: 'vehicleId, latitude e longitude são obrigatórios' 
      });
    }

    // Buscar o veículo
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    // Criar nova entrada de localização
    const locationData = {
      vehicleId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      speed: speed ? parseFloat(speed) : 0,
      heading: heading ? parseFloat(heading) : 0,
      altitude: altitude ? parseFloat(altitude) : null,
      accuracy: accuracy ? parseFloat(accuracy) : null,
      battery: battery ? parseFloat(battery) : null,
      signal: signal ? parseFloat(signal) : null,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    };

    const location = new Location(locationData);
    await location.save();

    // Atualizar última localização do veículo
    await vehicle.updateLocation({
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      speed: locationData.speed,
      timestamp: locationData.timestamp
    });

    // Verificar alertas
    const alerts = [];
    
    // Alerta de velocidade
    if (vehicle.alerts.speedLimit && locationData.speed > vehicle.alerts.speedLimit) {
      alerts.push({
        type: 'speed_limit',
        message: `Velocidade acima do limite: ${locationData.speed} km/h`,
        severity: 'high'
      });
    }

    // Alerta de bateria baixa
    if (locationData.battery !== null && locationData.battery < 20) {
      alerts.push({
        type: 'low_battery',
        message: `Bateria baixa: ${locationData.battery}%`,
        severity: 'medium'
      });
    }

    // Alerta de sinal fraco
    if (locationData.signal !== null && locationData.signal < 30) {
      alerts.push({
        type: 'no_signal',
        message: `Sinal fraco: ${locationData.signal}%`,
        severity: 'low'
      });
    }

    // Adicionar alertas à localização se houver
    if (alerts.length > 0) {
      location.alerts = alerts;
      await location.save();
    }

    // Emitir evento via WebSocket para clientes conectados
    if (req.io) {
      req.io.to(`vehicle_${vehicleId}`).emit('location_update', {
        vehicleId,
        location: locationData,
        alerts
      });
    }

    res.status(201).json({
      message: 'Localização registrada com sucesso',
      location: locationData,
      alerts
    });

  } catch (error) {
    console.error('Erro ao registrar localização:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/location/:vehicleId - Obter localização atual de um veículo
router.get('/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    if (!vehicle.lastLocation) {
      return res.status(404).json({ error: 'Nenhuma localização disponível' });
    }

    res.json(vehicle.lastLocation);
  } catch (error) {
    console.error('Erro ao buscar localização:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/location/:vehicleId/history - Obter histórico de localizações
router.get('/:vehicleId/history', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { start, end, limit = 100 } = req.query;

    // Verificar se o veículo existe
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    // Construir query
    const query = { vehicleId };
    if (start || end) {
      query.timestamp = {};
      if (start) query.timestamp.$gte = new Date(start);
      if (end) query.timestamp.$lte = new Date(end);
    }

    const locations = await Location.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(locations);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/location/:vehicleId/route - Obter rota de um período específico
router.get('/:vehicleId/route', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ 
        error: 'Parâmetros start e end são obrigatórios' 
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    const locations = await Location.findByVehicleAndPeriod(
      vehicleId,
      new Date(start),
      new Date(end)
    );

    // Formatar dados para visualização no mapa
    const route = locations.map(loc => ({
      lat: loc.latitude,
      lng: loc.longitude,
      speed: loc.speed,
      timestamp: loc.timestamp,
      heading: loc.heading
    }));

    res.json({
      vehicleId,
      route,
      totalPoints: route.length,
      startDate: start,
      endDate: end
    });
  } catch (error) {
    console.error('Erro ao buscar rota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/location/alerts/:vehicleId - Obter alertas de um veículo
router.get('/alerts/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { type, limit = 50 } = req.query;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    const locations = await Location.findWithAlerts(vehicleId, type)
      .limit(parseInt(limit));

    const alerts = locations
      .filter(loc => loc.alerts && loc.alerts.length > 0)
      .flatMap(loc => 
        loc.alerts.map(alert => ({
          ...alert.toObject(),
          location: {
            latitude: loc.latitude,
            longitude: loc.longitude,
            timestamp: loc.timestamp
          }
        }))
      );

    res.json(alerts);
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/location/stats/:vehicleId - Obter estatísticas de um veículo
router.get('/stats/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { start, end } = req.query;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    const query = { vehicleId };
    if (start || end) {
      query.timestamp = {};
      if (start) query.timestamp.$gte = new Date(start);
      if (end) query.timestamp.$lte = new Date(end);
    }

    const locations = await Location.find(query).sort({ timestamp: 1 });

    if (locations.length === 0) {
      return res.json({
        totalPoints: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        totalDistance: 0,
        totalTime: 0
      });
    }

    // Calcular estatísticas
    const speeds = locations.map(loc => loc.speed).filter(speed => speed > 0);
    const averageSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
    const maxSpeed = Math.max(...speeds, 0);
    
    const totalTime = (locations[locations.length - 1].timestamp - locations[0].timestamp) / 1000 / 60; // em minutos

    // Calcular distância total (aproximada)
    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];
      const distance = calculateDistance(
        prev.latitude, prev.longitude,
        curr.latitude, curr.longitude
      );
      totalDistance += distance;
    }

    res.json({
      totalPoints: locations.length,
      averageSpeed: Math.round(averageSpeed * 100) / 100,
      maxSpeed: Math.round(maxSpeed * 100) / 100,
      totalDistance: Math.round(totalDistance * 100) / 100, // em km
      totalTime: Math.round(totalTime * 100) / 100, // em minutos
      startDate: locations[0].timestamp,
      endDate: locations[locations.length - 1].timestamp
    });

  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função auxiliar para calcular distância entre dois pontos
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = router; 