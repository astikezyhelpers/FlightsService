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
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  passport: {
    number: {
      type: String,
      required: true,
      uppercase: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    country: {
      type: String,
      required: true,
      uppercase: true
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
      code: String,
      name: String,
      city: String,
      country: String,
      terminal: String
    },
    destination: {
      code: String,
      name: String,
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
    duration: Number
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
    required: true,
    validate: {
      validator: function(passengers) {
        return passengers.length > 0;
      },
      message: 'At least one passenger is required'
    }
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
  payment: {
    method: {
      type: String,
      enum: ['WALLET', 'CREDIT_CARD'],
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
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
    }
  }
}, {
  timestamps: true,
  collection: 'bookings'
});

// Indexes for booking queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ companyId: 1, createdAt: -1 });
// bookingSchema.index({ confirmationCode: 1 });

export default mongoose.model('Booking', bookingSchema);