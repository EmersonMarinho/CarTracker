const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'ID do veículo é obrigatório'],
    index: true
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude é obrigatória'],
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude é obrigatória'],
    min: -180,
    max: 180
  },
  speed: {
    type: Number,
    min: 0,
    default: 0
  },
  heading: {
    type: Number,
    min: 0,
    max: 360,
    default: 0
  },
  altitude: {
    type: Number,
    default: null
  },
  accuracy: {
    type: Number,
    min: 0,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    required: [true, 'Timestamp é obrigatório'],
    default: Date.now,
    index: true
  },
  source: {
    type: String,
    enum: ['gps', 'manual', 'estimated'],
    default: 'gps'
  },
  battery: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  signal: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  alerts: [{
    type: {
      type: String,
      enum: ['speed_limit', 'geofence_exit', 'geofence_entry', 'low_battery', 'no_signal'],
      required: true
    },
    message: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Índices compostos para consultas eficientes
locationSchema.index({ vehicleId: 1, timestamp: -1 });
locationSchema.index({ timestamp: -1 });
locationSchema.index({ 'alerts.timestamp': -1 });

// Método estático para buscar localizações de um veículo em um período
locationSchema.statics.findByVehicleAndPeriod = function(vehicleId, startDate, endDate) {
  return this.find({
    vehicleId,
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ timestamp: 1 });
};

// Método estático para buscar última localização de um veículo
locationSchema.statics.findLastByVehicle = function(vehicleId) {
  return this.findOne({ vehicleId }).sort({ timestamp: -1 });
};

// Método estático para buscar localizações com alertas
locationSchema.statics.findWithAlerts = function(vehicleId, alertType = null) {
  const query = { vehicleId };
  if (alertType) {
    query['alerts.type'] = alertType;
  }
  return this.find(query).sort({ timestamp: -1 });
};

// Virtual para calcular distância da localização anterior (se existir)
locationSchema.virtual('distanceFromPrevious').get(function() {
  // Esta função seria implementada se necessário
  return null;
});

// Middleware para limpar dados antigos (TTL index)
// Manter apenas 30 dias de histórico por padrão
locationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Location', locationSchema); 