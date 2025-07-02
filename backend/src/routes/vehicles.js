const express = require('express');
const Vehicle = require('../models/Vehicle');
const router = express.Router();

// GET /api/vehicles - Listar todos os veículos
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const vehicles = await Vehicle.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments(query);

    res.json({
      vehicles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/vehicles/:id - Buscar veículo específico
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/vehicles - Criar novo veículo
router.post('/', async (req, res) => {
  try {
    const vehicleData = req.body;
    
    // Verificar se já existe veículo com a mesma placa
    const existingVehicle = await Vehicle.findOne({ 
      licensePlate: vehicleData.licensePlate.toUpperCase() 
    });
    
    if (existingVehicle) {
      return res.status(400).json({ 
        error: 'Já existe um veículo com esta placa' 
      });
    }

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/vehicles/:id - Atualizar veículo
router.put('/:id', async (req, res) => {
  try {
    const vehicleData = req.body;
    
    // Se estiver atualizando a placa, verificar se não existe outro veículo com ela
    if (vehicleData.licensePlate) {
      const existingVehicle = await Vehicle.findOne({ 
        licensePlate: vehicleData.licensePlate.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      
      if (existingVehicle) {
        return res.status(400).json({ 
          error: 'Já existe outro veículo com esta placa' 
        });
      }
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      vehicleData,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/vehicles/:id - Deletar veículo
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    res.json({ message: 'Veículo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/vehicles/:id/location - Obter localização atual do veículo
router.get('/:id/location', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
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

// GET /api/vehicles/active/count - Contar veículos ativos
router.get('/active/count', async (req, res) => {
  try {
    const count = await Vehicle.countDocuments({ status: 'active' });
    res.json({ count });
  } catch (error) {
    console.error('Erro ao contar veículos ativos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/vehicles/search/:query - Buscar veículos por termo
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    const vehicles = await Vehicle.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { licensePlate: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { model: { $regex: query, $options: 'i' } },
        { 'owner.name': { $regex: query, $options: 'i' } }
      ]
    })
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

    res.json(vehicles);
  } catch (error) {
    console.error('Erro na busca:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 