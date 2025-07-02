const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do veículo é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  licensePlate: {
    type: String,
    required: [true, 'Placa é obrigatória'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/, 'Formato de placa inválido (Mercosul)']
  },
  brand: {
    type: String,
    required: [true, 'Marca é obrigatória'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Modelo é obrigatório'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Ano é obrigatório'],
    min: [1900, 'Ano deve ser maior que 1900'],
    max: [new Date().getFullYear() + 1, 'Ano não pode ser no futuro']
  },
  color: {
    type: String,
    required: [true, 'Cor é obrigatória'],
    trim: true
  },
  vin: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true,
    match: [/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN deve ter 17 caracteres alfanuméricos']
  },
  deviceId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'stolen'],
    default: 'active'
  },
  lastLocation: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    },
    speed: {
      type: Number,
      min: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    address: String
  },
  owner: {
    name: {
      type: String,
      required: [true, 'Nome do proprietário é obrigatório']
    },
    email: {
      type: String,
      required: [true, 'Email do proprietário é obrigatório'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    phone: {
      type: String,
      required: [true, 'Telefone do proprietário é obrigatório']
    }
  },
  alerts: {
    speedLimit: {
      type: Number,
      default: 80,
      min: 0
    },
    geofence: {
      enabled: {
        type: Boolean,
        default: false
      },
      coordinates: [{
        latitude: Number,
        longitude: Number
      }]
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para melhor performance
vehicleSchema.index({ licensePlate: 1 });
vehicleSchema.index({ deviceId: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ 'lastLocation.timestamp': -1 });

// Virtual para calcular se o veículo está em movimento
vehicleSchema.virtual('isMoving').get(function() {
  if (!this.lastLocation || !this.lastLocation.speed) return false;
  return this.lastLocation.speed > 5; // Considera em movimento se velocidade > 5 km/h
});

// Virtual para calcular tempo desde última atualização
vehicleSchema.virtual('lastUpdateAgo').get(function() {
  if (!this.lastLocation || !this.lastLocation.timestamp) return null;
  return Date.now() - this.lastLocation.timestamp.getTime();
});

// Middleware para validar dados antes de salvar
vehicleSchema.pre('save', function(next) {
  // Converter placa para maiúsculas
  if (this.licensePlate) {
    this.licensePlate = this.licensePlate.toUpperCase();
  }
  
  // Converter VIN para maiúsculas
  if (this.vin) {
    this.vin = this.vin.toUpperCase();
  }
  
  next();
});

// Método estático para buscar veículos ativos
vehicleSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Método de instância para atualizar localização
vehicleSchema.methods.updateLocation = function(locationData) {
  this.lastLocation = {
    ...this.lastLocation,
    ...locationData,
    timestamp: new Date()
  };
  return this.save();
};

module.exports = mongoose.model('Vehicle', vehicleSchema); 