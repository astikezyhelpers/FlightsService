import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['ADULT', 'CHILD', 'INFANT'],
    required: true
  },
  title: {
    type: String,
    required: true,
    enum: ['Mr', 'Mrs', 'Ms', 'Dr', 'Master', 'Miss']
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  passport: {
    number: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 5,
      maxlength: 20
    },
    expiryDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(value) {
          return value > new Date();
        },
        message: 'Passport must be valid (not expired)'
      }
    },
    country: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 2,
      maxlength: 3
    }
  },
  specialRequests: [{
    type: String,
    enum: ['VEGETARIAN_MEAL', 'WHEELCHAIR_ASSISTANCE', 'EXTRA_LEGROOM', 'WINDOW_SEAT', 'AISLE_SEAT']
  }]
});

const flightSegmentSchema = new mongoose.Schema({
  flightId: {
    type: String,
    required: true
  },
  flightNumber: {
    type: String,
    required: true
  },
  route: {
    origin: {
      code: {
        type: String,
        required: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3
      },
      name: {
        type: String,
        required: true
      },
      city: String,
      country: String,
      terminal: String
    },
    destination: {
      code: {
        type: String,
        required: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3
      },
      name: {
        type: String,
        required: true
      },
      city: String,
      country: String,
      terminal: String
    }
  },
  schedule: {
    departureTime: {
      type: Date,
      required: true
    },
    arrivalTime: {
      type: Date,
      required: true
    },
    duration: {
      type: Number,
      min: 0
    }
  },
  seatClass: {
    type: String,
    enum: ['ECONOMY', 'BUSINESS', 'FIRST'],
    required: true
  },
  seatNumber: {
    type: String
  }
});

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  companyId: {
    type: String,
    required: true,
    index: true
  },
  flightDetails: {
    outbound: {
      type: flightSegmentSchema,
      required: true
    },
    return: {
      type: flightSegmentSchema
      // Optional for one-way flights
    }
  },
  passengers: [{
    type: passengerSchema,
    required: true
  }],
  pricing: {
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
    fees: {
      type: Number,
      required: true,
      min: 0
    },
    markup: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true
    }
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: true
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['WALLET', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING'],
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED'],
      default: 'PENDING'
    },
    transactionId: {
      type: String
    },
    paidAt: {
      type: Date
    }
  },
  status: {
    type: String,
    enum: ['DRAFT', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    default: 'DRAFT',
    index: true
  },
  confirmationCode: {
    type: String,
    unique: true,
    sparse: true
  },
  externalBookingRef: {
    type: String
  },
  provider: {
    type: String,
    enum: ['AMADEUS', 'SABRE']
  },
  metadata: {
    bookedBy: {
      type: String
    },
    approvedBy: {
      type: String
    },
    reason: {
      type: String
    },
    costCenter: {
      type: String
    },
    amadeusOrderId: {
      type: String
    },
    amadeusPnr: {
      type: String
    },
    dataSource: {
      type: String,
      enum: ['AMADEUS_REAL_TIME', 'TEST_FALLBACK']
    }
  }
}, {
  timestamps: true,
  collection: 'bookings'
});

// Custom validation for passengers array
bookingSchema.path('passengers').validate(function(passengers) {
  if (!passengers || passengers.length === 0) {
    return false;
  }
  
  // Check if at least one adult passenger
  const hasAdult = passengers.some(p => p.type === 'ADULT');
  if (!hasAdult) {
    return false;
  }
  
  // Check total passenger count
  if (passengers.length > 9) {
    return false;
  }
  
  return true;
}, 'At least one adult passenger is required and maximum 9 passengers allowed');

// Indexes for booking queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ companyId: 1, createdAt: -1 });
bookingSchema.index({ confirmationCode: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);