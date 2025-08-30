import mongoose from "mongoose";

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: true,
    index: true
  },
  airline: {
    code: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    logo: {
      type: String
    }
  },
  route: {
    origin: {
      code: {
        type: String,
        required: true,
        uppercase: true
      },
      name: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      },
      terminal: {
        type: String
      }
    },
    destination: {
      code: {
        type: String,
        required: true,
        uppercase: true
      },
      name: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      },
      terminal: {
        type: String
      }
    }
  },
  schedule: {
    departureTime: {
      type: Date,
      required: true,
      index: true
    },
    arrivalTime: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  aircraft: {
    type: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    seatConfiguration: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  pricing: {
    economy: {
      basePrice: {
        type: Number,
        required: true,
        min: 0
      },
      taxes: {
        type: Number,
        required: true,
        min: 0
      },
      totalPrice: {
        type: Number,
        required: true,
        min: 0
      },
      availability: {
        type: Number,
        required: true,
        min: 0
      }
    },
    business: {
      basePrice: {
        type: Number,
        required: true,
        min: 0
      },
      taxes: {
        type: Number,
        required: true,
        min: 0
      },
      totalPrice: {
        type: Number,
        required: true,
        min: 0
      },
      availability: {
        type: Number,
        required: true,
        min: 0
      }
    },
    first: {
      basePrice: {
        type: Number,
        required: true,
        min: 0
      },
      taxes: {
        type: Number,
        required: true,
        min: 0
      },
      totalPrice: {
        type: Number,
        required: true,
        min: 0
      },
      availability: {
        type: Number,
        required: true,
        min: 0
      }
    }
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'CANCELLED', 'DELAYED'],
    default: 'ACTIVE',
    index: true
  },
  externalId: {
    type: String,
    index: true
  },
  provider: {
    type: String,
    enum: ['AMADEUS', 'SABRE'],
    required: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'flights'
});

// Compound index for route and date queries
flightSchema.index({
  'route.origin.code': 1,
  'route.destination.code': 1,
  'schedule.departureTime': 1
});

// TTL index for external API cache
flightSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });
export default mongoose.model('Flight', flightSchema);