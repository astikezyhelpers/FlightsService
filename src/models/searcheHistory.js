import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  searchCriteria: {
    origin: {
      type: String,
      required: true,
      uppercase: true
    },
    destination: {
      type: String,
      required: true,
      uppercase: true
    },
    departureDate: {
      type: Date,
      required: true
    },
    returnDate: {
      type: Date
      // Optional for one-way flights
    },
    passengers: {
      adults: {
        type: Number,
        required: true,
        min: 1,
        max: 9
      },
      children: {
        type: Number,
        default: 0,
        min: 0,
        max: 9
      },
      infants: {
        type: Number,
        default: 0,
        min: 0,
        max: 9
      }
    },
    class: {
      type: String,
      enum: ['ECONOMY', 'BUSINESS', 'FIRST'],
      default: 'ECONOMY'
    },
    directFlights: {
      type: Boolean,
      default: false
    },
    maxStops: {
      type: Number,
      default: 2,
      min: 0,
      max: 5
    },
    preferredAirlines: [{
      type: String,
      uppercase: true
    }],
    sortBy: {
      type: String,
      enum: ['price', 'duration', 'departure'],
      default: 'price'
    },
    sortOrder: {
      type: String,
      enum: ['asc', 'desc'],
      default: 'asc'
    }
  },
  resultsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  executionTime: {
    type: Number, // in milliseconds
    min: 0
  },
  searchId: {
    type: String,
    unique: true
  },
  // Additional metadata for analytics
  metadata: {
    userAgent: String,
    ipAddress: String,
    sessionId: String,
    searchSource: {
      type: String,
      enum: ['WEB', 'MOBILE', 'API'],
      default: 'WEB'
    }
  }
}, {
  timestamps: true,
  collection: 'search_history'
});

// Indexes for search history queries
searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ 
  'searchCriteria.origin': 1, 
  'searchCriteria.destination': 1,
  createdAt: -1 
});

// TTL index to automatically delete old search history (optional)
// searchHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export default mongoose.model('SearchHistory', searchHistorySchema);