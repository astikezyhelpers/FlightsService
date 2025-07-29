# Flight Service - Low Level Design

## 1. Service Overview

### 1.1 Service Context
- **Service Name**: Flight Service
- **Port**: 3004
- **Database**: MongoDB
- **Primary Responsibilities**: Flight search integration, booking management, pricing calculations, availability checking
- **Architecture Pattern**: Microservice with Domain-Driven Design

### 1.2 Service Boundaries
The Flight Service is responsible for:
- Integration with external flight APIs (Amadeus, Sabre)
- Real-time flight search and availability
- Flight booking lifecycle management
- Pricing calculations and fare rules
- Inventory management and seat selection
- Flight schedule management

## 2. Detailed System Architecture

### 2.1 Service Internal Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FLIGHT SERVICE ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │  API Gateway    │    │   Load Balancer │    │  Rate Limiter   │     │
│  │  - Routing      │────│   - Distribution│────│  - Throttling   │     │
│  │  - Validation   │    │   - Health Check│    │  - Circuit Break│     │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│                                  │                                      │
│                                  ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    CONTROLLER LAYER                             │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  FlightSearchController  │  FlightBookingController  │ Admin    │   │
│  │  - POST /search          │  - POST /book            │ Controller│   │
│  │  - GET /availability     │  - GET /bookings/{id}    │          │   │
│  │  - GET /pricing          │  - PUT /bookings/{id}    │          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  │                                      │
│                                  ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    SERVICE LAYER                                │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  FlightSearchService    │  FlightBookingService │  PricingService│   │
│  │  - Search orchestration │  - Booking workflow   │  - Fare calc   │   │
│  │  - Results aggregation  │  - Status management  │  - Tax calc    │   │
│  │  - Caching strategy     │  - Validation rules   │  - Markup calc │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  │                                      │
│                                  ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   DOMAIN LAYER                                  │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  Flight Entity │ Booking Entity │ Passenger Entity │ Route Entity│   │
│  │  - Properties  │ - State Machine│ - Validation     │ - Logic     │   │
│  │  - Business    │ - Business     │ - Business Rules │ - Algorithms│   │
│  │    Rules       │   Rules        │                  │             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  │                                      │
│                                  ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                 REPOSITORY LAYER                                │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │  FlightRepository │ BookingRepository │ CacheRepository │ Event  │   │
│  │  - CRUD Ops       │ - CRUD Ops        │ - Redis Ops     │ Repo   │   │
│  │  - Query Builder  │ - Query Builder   │ - TTL Mgmt      │        │   │
│  │  - Indexes        │ - Transactions    │ - Invalidation  │        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                  │                                      │
│                                  ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   DATA LAYER                                    │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │     MongoDB        │      Redis Cache     │   External APIs     │   │
│  │  - Flight Data     │   - Search Results   │  - Amadeus API      │   │
│  │  - Booking Data    │   - User Sessions    │  - Sabre API        │   │
│  │  - User Prefs      │   - Rate Limits      │  - Airline APIs     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Interaction Diagram

```
┌─────────────┐    HTTP Request    ┌─────────────────┐
│   Client    │──────────────────▶│  API Gateway    │
│ Application │                   │                 │
└─────────────┘                   └─────────────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │ Flight Service  │
                                  │ Controller      │
                                  └─────────────────┘
                                           │
                                           ▼
                        ┌─────────────────────────────────────┐
                        │                                     │
                        ▼                                     ▼
              ┌─────────────────┐                  ┌─────────────────┐
              │ Search Service  │                  │Booking Service  │
              │                 │                  │                 │
              └─────────────────┘                  └─────────────────┘
                        │                                     │
                        ▼                                     ▼
              ┌─────────────────┐                  ┌─────────────────┐
              │External API     │                  │   MongoDB       │
              │Integration      │                  │   Repository    │
              │(Amadeus/Sabre) │                  │                 │
              └─────────────────┘                  └─────────────────┘
                        │                                     │
                        ▼                                     ▼
              ┌─────────────────┐                  ┌─────────────────┐
              │  Redis Cache    │                  │  Event Publisher│
              │                 │                  │                 │
              └─────────────────┘                  └─────────────────┘
```

## 3. Data Model Design

### 3.1 MongoDB Collections Schema

#### 3.1.1 Flight Collection
```json
{
  "_id": "ObjectId",
  "flightNumber": "String",
  "airline": {
    "code": "String",
    "name": "String",
    "logo": "String"
  },
  "route": {
    "origin": {
      "code": "String",
      "name": "String",
      "city": "String",
      "country": "String",
      "terminal": "String"
    },
    "destination": {
      "code": "String",
      "name": "String", 
      "city": "String",
      "country": "String",
      "terminal": "String"
    }
  },
  "schedule": {
    "departureTime": "ISODate",
    "arrivalTime": "ISODate",
    "duration": "Number",
    "timezone": "String"
  },
  "aircraft": {
    "type": "String",
    "model": "String",
    "seatConfiguration": "Object"
  },
  "pricing": {
    "economy": {
      "basePrice": "Number",
      "taxes": "Number",
      "totalPrice": "Number",
      "availability": "Number"
    },
    "business": {
      "basePrice": "Number",
      "taxes": "Number", 
      "totalPrice": "Number",
      "availability": "Number"
    },
    "first": {
      "basePrice": "Number",
      "taxes": "Number",
      "totalPrice": "Number", 
      "availability": "Number"
    }
  },
  "status": "String", // ACTIVE, CANCELLED, DELAYED
  "externalId": "String",
  "provider": "String", // AMADEUS, SABRE
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

#### 3.1.2 Booking Collection
```json
{
  "_id": "ObjectId",
  "bookingId": "String", // Unique booking reference
  "userId": "String",
  "companyId": "String",
  "flightDetails": {
    "outbound": {
      "flightId": "ObjectId",
      "flightNumber": "String",
      "route": "Object",
      "schedule": "Object",
      "seatClass": "String",
      "seatNumber": "String"
    },
    "return": {
      "flightId": "ObjectId",
      "flightNumber": "String", 
      "route": "Object",
      "schedule": "Object",
      "seatClass": "String",
      "seatNumber": "String"
    }
  },
  "passengers": [{
    "type": "String", // ADULT, CHILD, INFANT
    "title": "String",
    "firstName": "String",
    "lastName": "String",
    "dateOfBirth": "ISODate",
    "passport": {
      "number": "String",
      "expiryDate": "ISODate",
      "country": "String"
    },
    "specialRequests": ["String"]
  }],
  "pricing": {
    "basePrice": "Number",
    "taxes": "Number",
    "fees": "Number",
    "totalPrice": "Number",
    "currency": "String"
  },
  "payment": {
    "method": "String", // WALLET, CREDIT_CARD
    "status": "String", // PENDING, PAID, FAILED
    "transactionId": "String",
    "paidAt": "ISODate"
  },
  "status": "String", // DRAFT, CONFIRMED, CANCELLED, COMPLETED
  "confirmationCode": "String",
  "externalBookingRef": "String",
  "provider": "String",
  "metadata": {
    "bookedBy": "String",
    "approvedBy": "String",
    "reason": "String",
    "costCenter": "String"
  },
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

#### 3.1.3 Search History Collection
```json
{
  "_id": "ObjectId",
  "userId": "String",
  "searchCriteria": {
    "origin": "String",
    "destination": "String", 
    "departureDate": "ISODate",
    "returnDate": "ISODate",
    "passengers": {
      "adults": "Number",
      "children": "Number",
      "infants": "Number"
    },
    "class": "String"
  },
  "resultsCount": "Number",
  "executionTime": "Number",
  "createdAt": "ISODate"
}
```

### 3.2 Database Indexes

#### 3.2.1 Flight Collection Indexes
```javascript
// Compound index for route and date queries
db.flights.createIndex({
  "route.origin.code": 1,
  "route.destination.code": 1,
  "schedule.departureTime": 1
})

// Index for flight number queries
db.flights.createIndex({"flightNumber": 1})

// Index for airline queries
db.flights.createIndex({"airline.code": 1})

// Index for status queries
db.flights.createIndex({"status": 1})

// TTL index for external API cache
db.flights.createIndex({"createdAt": 1}, {expireAfterSeconds: 3600})
```

#### 3.2.2 Booking Collection Indexes
```javascript
// Index for user bookings
db.bookings.createIndex({"userId": 1, "createdAt": -1})

// Index for company bookings
db.bookings.createIndex({"companyId": 1, "createdAt": -1})

// Index for booking reference
db.bookings.createIndex({"bookingId": 1})

// Index for confirmation code
db.bookings.createIndex({"confirmationCode": 1})

// Index for status queries
db.bookings.createIndex({"status": 1})
```

## 4. API Specification

### 4.1 Flight Search APIs

#### 4.1.1 Search Flights
```
POST /api/v1/flights/search
Content-Type: application/json
Authorization: Bearer <token>

Request Body:
{
  "origin": "BLR",
  "destination": "DEL", 
  "departureDate": "2025-08-15",
  "returnDate": "2025-08-20", // Optional for round trip
  "passengers": {
    "adults": 1,
    "children": 0,
    "infants": 0
  },
  "class": "ECONOMY", // ECONOMY, BUSINESS, FIRST
  "directFlights": false,
  "maxStops": 2,
  "preferredAirlines": ["6E", "AI"],
  "sortBy": "price", // price, duration, departure
  "sortOrder": "asc"
}

Response:
{
  "success": true,
  "data": {
    "searchId": "search_123456",
    "flights": [{
      "flightId": "flight_789",
      "flightNumber": "6E2043",
      "airline": {
        "code": "6E",
        "name": "IndiGo"
      },
      "route": {
        "origin": {"code": "BLR", "name": "Bengaluru"},
        "destination": {"code": "DEL", "name": "Delhi"}
      },
      "schedule": {
        "departureTime": "2025-08-15T06:30:00Z",
        "arrivalTime": "2025-08-15T09:15:00Z",
        "duration": 165
      },
      "pricing": {
        "economy": {
          "basePrice": 4500,
          "taxes": 890,
          "totalPrice": 5390,
          "availability": 9
        }
      },
      "stops": 0,
      "aircraft": "A320",
      "amenities": ["WIFI", "MEAL"]
    }],
    "totalResults": 45,
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  },
  "executionTime": 2.3
}
```

#### 4.1.2 Get Flight Availability
```
GET /api/v1/flights/{flightId}/availability?date=2025-08-15&class=ECONOMY
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "flightId": "flight_789",
    "date": "2025-08-15",
    "availability": {
      "economy": 9,
      "business": 3,
      "first": 0
    },
    "seatMap": {
      "rows": 30,
      "seatsPerRow": 6,
      "availableSeats": ["1A", "1B", "2C"]
    }
  }
}
```

### 4.2 Flight Booking APIs

#### 4.2.1 Create Booking
```
POST /api/v1/flights/book
Content-Type: application/json
Authorization: Bearer <token>

Request Body:
{
  "searchId": "search_123456",
  "flightSelection": {
    "outbound": {
      "flightId": "flight_789",
      "class": "ECONOMY",
      "seatPreference": "WINDOW"
    },
    "return": {
      "flightId": "flight_790", 
      "class": "ECONOMY",
      "seatPreference": "AISLE"
    }
  },
  "passengers": [{
    "type": "ADULT",
    "title": "Mr",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15",
    "passport": {
      "number": "A12345678",
      "expiryDate": "2030-05-15",
      "country": "IN"
    },
    "specialRequests": ["VEGETARIAN_MEAL"]
  }],
  "contactInfo": {
    "email": "john.doe@company.com",
    "phone": "+91-9876543210"
  },
  "paymentMethod": "WALLET",
  "businessJustification": "Client meeting in Delhi"
}

Response:
{
  "success": true,
  "data": {
    "bookingId": "BK123456789",
    "status": "CONFIRMED",
    "confirmationCode": "ABC123",
    "totalPrice": 10780,
    "currency": "INR",
    "expiresAt": "2025-08-01T18:00:00Z",
    "eTickets": ["ticket_url_1", "ticket_url_2"]
  }
}
```

#### 4.2.2 Get Booking Details
```
GET /api/v1/flights/bookings/{bookingId}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "bookingId": "BK123456789",
    "status": "CONFIRMED",
    "flightDetails": {
      "outbound": {
        "flightNumber": "6E2043",
        "route": "BLR → DEL",
        "schedule": {
          "departureTime": "2025-08-15T06:30:00Z",
          "arrivalTime": "2025-08-15T09:15:00Z"
        },
        "seat": "12A"
      }
    },
    "passengers": [...],
    "pricing": {...},
    "payment": {
      "status": "PAID",
      "method": "WALLET",
      "transactionId": "TXN789"
    }
  }
}
```

### 4.3 Booking Management APIs

#### 4.3.1 Cancel Booking
```
PUT /api/v1/flights/bookings/{bookingId}/cancel
Authorization: Bearer <token>

Request Body:
{
  "reason": "Travel plans changed",
  "refundToWallet": true
}

Response:
{
  "success": true,
  "data": {
    "bookingId": "BK123456789",
    "status": "CANCELLED",
    "cancellationFee": 500,
    "refundAmount": 10280,
    "refundMethod": "WALLET",
    "refundETA": "2-3 business days"
  }
}
```

#### 4.3.2 Modify Booking
```
PUT /api/v1/flights/bookings/{bookingId}/modify
Authorization: Bearer <token>

Request Body:
{
  "modificationType": "DATE_CHANGE",
  "newDepartureDate": "2025-08-16",
  "reason": "Meeting rescheduled"
}

Response:
{
  "success": true,
  "data": {
    "bookingId": "BK123456789",
    "status": "MODIFIED", 
    "changeFee": 2000,
    "priceDifference": 500,
    "totalAdditionalCharge": 2500,
    "newConfirmationCode": "XYZ789"
  }
}
```

## 5. Sequence Diagrams

### 5.1 Flight Search Flow

```
┌────────┐    ┌─────────────┐    ┌───────────────┐    ┌─────────────┐    ┌──────────────┐
│ Client │    │ API Gateway │    │Flight Service │    │ Redis Cache │    │External APIs │
└───┬────┘    └──────┬──────┘    └───────┬───────┘    └──────┬──────┘    └──────┬───────┘
    │                │                   │                   │                  │
    │ POST /search   │                   │                   │                  │
    ├───────────────▶│                   │                   │                  │
    │                │ Validate & Route  │                   │                  │
    │                ├──────────────────▶│                   │                  │
    │                │                   │ Check Cache       │                  │
    │                │                   ├──────────────────▶│                  │
    │                │                   │ Cache Miss        │                  │
    │                │                   │◀──────────────────┤                  │
    │                │                   │ Search Request    │                  │
    │                │                   ├─────────────────────────────────────▶│
    │                │                   │ Flight Results    │                  │
    │                │                   │◀─────────────────────────────────────┤
    │                │                   │ Store in Cache    │                  │
    │                │                   ├──────────────────▶│                  │
    │                │ Search Results    │                   │                  │
    │                │◀──────────────────┤                   │                  │
    │ Flight Results │                   │                   │                  │
    │◀───────────────┤                   │                   │                  │
```

### 5.2 Flight Booking Flow

```
┌────────┐   ┌─────────────┐   ┌───────────────┐   ┌─────────────┐   ┌─────────────┐
│ Client │   │ API Gateway │   │Flight Service │   │   MongoDB   │   │Event Queue  │
└───┬────┘   └──────┬──────┘   └───────┬───────┘   └──────┬──────┘   └──────┬──────┘
    │               │                  │                  │                 │
    │ POST /book    │                  │                  │                 │
    ├──────────────▶│                  │                  │                 │
    │               │ Authorize        │                  │                 │
    │               ├─────────────────▶│                  │                 │
    │               │                  │ Validate Flight  │                 │
    │               │                  │ Availability     │                 │
    │               │                  ├─────────────────▶│                 │
    │               │                  │ Available        │                 │
    │               │                  │◀─────────────────┤                 │
    │               │                  │ Create Booking   │                 │
    │               │                  ├─────────────────▶│                 │
    │               │                  │ Booking Created  │                 │
    │               │                  │◀─────────────────┤                 │
    │               │                  │ Publish Event    │                 │
    │               │                  ├────────────────────────────────────▶│
    │               │ Booking Success  │                  │                 │
    │               │◀─────────────────┤                  │                 │
    │ Booking Conf. │                  │                  │                 │
    │◀──────────────┤                  │                  │                 │
```

## 6. Error Handling Strategy

### 6.1 Error Categories

#### 6.1.1 Client Errors (4xx)
```javascript
// Validation Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "departureDate",
      "issue": "Date must be in future"
    }
  },
  "statusCode": 400
}

// Authentication Error
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  },
  "statusCode": 401
}

// Resource Not Found
{
  "success": false,
  "error": {
    "code": "FLIGHT_NOT_FOUND",
    "message": "Flight with given ID not found"
  },
  "statusCode": 404
}
```

#### 6.1.2 Server Errors (5xx)
```javascript
// External API Error
{
  "success": false,
  "error": {
    "code": "EXTERNAL_API_ERROR",
    "message": "Flight search service temporarily unavailable",
    "retryAfter": 30
  },
  "statusCode": 502
}

// Database Error
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Unable to process request at this time"
  },
  "statusCode": 500
}
```

### 6.2 Error Handling Flow
```
┌─────────────┐    Error     ┌─────────────────┐    Log Error    ┌─────────────┐
│  Controller │─────────────▶│  Error Handler  │────────────────▶│   Logger    │
└─────────────┘              └─────────────────┘                 └─────────────┘
                                      │
                                      ▼
                              ┌─────────────────┐
                              │  Error Response │
                              │  Formatter      │
                              └─────────────────┘
                                      │
                                      ▼
                              ┌─────────────────┐
                              │   Send Error    │
                              │   to Client     │
                              └─────────────────┘
```

## 7. Caching Strategy

### 7.1 Cache Layers

#### 7.1.1 Redis Cache Structure
```javascript
// Flight Search Results Cache
Key: "flight:search:{hash_of_search_params}"
Value: {
  "results": [...],
  "timestamp": "2025-07-29T10:30:00Z",
  "ttl": 300 // 5 minutes
}

// Flight Availability Cache  
Key: "flight:availability:{flightId}:{date}"
Value: {
  "economy": 9,
  "business": 3, 
  "first": 0,
  "timestamp": "2025-07-29T10:30:00Z",
  "ttl": 60 // 1 minute
}

// User Session Cache
Key: "session:{userId}"
Value: {
  "searchHistory": [...],
  "preferences": {...},
  "ttl": 1800 // 30 minutes
}
```

### 7.2 Cache Invalidation Strategy

```
┌─────────────────┐    Booking Event    ┌─────────────────┐
│  Booking        │────────────────────▶│  Cache          │
│  Service        │                     │  Invalidator    │
└─────────────────┘                     └─────────────────┘
                                                │
                                                ▼
                                        ┌─────────────────┐
                                        │  Invalidate     │
                                        │  Flight Avail   │
                                        │  Cache          │
                                        └─────────────────┘
```

## 8. Event-Driven Architecture

### 8.1 Event Schema

#### 8.1.1 Flight Booked Event
```json
{
  "eventType": "FLIGHT_BOOKED",
  "eventId": "evt_123456",
  "timestamp": "2025-07-29T10:30:00Z",
  "version": "1.0",
  "source": "flight-service",
  "data": {
    "bookingId": "BK123456789",
    "userId": "user_123",
    "companyId": "comp_456",
    "flightDetails": {
      "flightNumber": "6E2043",
      "route": "BLR-DEL",
      "departureDate": "2025-08-15"
    },
    "totalAmount": 5390,
    "currency": "INR"
  }
}
```

#### 8.1.2 Flight Cancelled Event
```json
{
  "eventType": "FLIGHT_CANCELLED", 
  "eventId": "evt_123457",
  "timestamp": "2025-07-29T11:00:00Z",
  "version": "1.0",
  "source": "flight-service",
  "data": {
    "bookingId": "BK123456789",
    "userId": "user_123",
    "cancellationReason": "User requested",
    "refundAmount": 4890,
    "cancellationFee": 500
  }
}
```

### 8.2 Event Publishing Flow

```
┌─────────────────┐    Business Event   ┌─────────────────┐    Publish Event   ┌─────────────────┐
│  Flight Service │───────────────────▶│  Event Publisher│───────────────────▶│  Message Queue  │
│  (Domain Logic) │                    │                 │                    │  (RabbitMQ)     │
└─────────────────┘                    └─────────────────┘                    └─────────────────┘
                                                                                       │
                                                                                       ▼
                                                                              ┌─────────────────┐
                                                                              │  Event          │
                                                                              │  Consumers      │
                                                                              │  - Wallet Svc   │
                                                                              │  - Notification │
                                                                              │  - Analytics    │
                                                                              └─────────────────┘
```

## 9. Security Implementation

### 9.1 Authentication & Authorization

#### 9.1.1 JWT Token Validation
```javascript
// Token Structure
{
  "sub": "user_123",
  "iat": 1643723400,
  "exp": 1643726000,
  "roles": ["EMPLOYEE"],
  "companyId": "comp_456",
  "permissions": [
    "FLIGHT_SEARCH",
    "FLIGHT_BOOK",
    "BOOKING_VIEW"
  ]
}

// Authorization Middleware Flow
┌─────────────┐    JWT Token    ┌─────────────────┐    Validate     ┌─────────────────┐
│   Request   │────────────────▶│  Auth           │────────────────▶│  User Mgmt      │
│   Headers   │                │  Middleware     │                │  Service        │
└─────────────┘                └─────────────────┘                └─────────────────┘
                                        │                                   │
                                        ▼                                   ▼
                                ┌─────────────────┐                ┌─────────────────┐
                                │  Extract User   │                │  Return User    │
                                │  Context        │◀───────────────│  Permissions    │
                                └─────────────────┘                └─────────────────┘
```

#### 9.1.2 Role-Based Access Control
```javascript
// Permission Matrix
const PERMISSIONS = {
  EMPLOYEE: [
    'FLIGHT_SEARCH',
    'FLIGHT_BOOK',
    'BOOKING_VIEW',
    'BOOKING_CANCEL'
  ],
  MANAGER: [
    'FLIGHT_SEARCH',
    'FLIGHT_BOOK', 
    'BOOKING_VIEW',
    'BOOKING_CANCEL',
    'TEAM_BOOKINGS_VIEW',
    'BOOKING_APPROVE'
  ],
  ADMIN: [
    'ALL_PERMISSIONS'
  ]
};

// Access Control Implementation
function checkPermission(userRole, requiredPermission) {
  const userPermissions = PERMISSIONS[userRole] || [];
  return userPermissions.includes('ALL_PERMISSIONS') || 
         userPermissions.includes(requiredPermission);
}
```

### 9.2 Data Security

#### 9.2.1 Sensitive Data Encryption
```javascript
// PII Data Encryption Schema
{
  "passenger": {
    "firstName": "encrypted_string",
    "lastName": "encrypted_string", 
    "passport": {
      "number": "encrypted_string",
      "expiryDate": "2030-05-15" // Non-sensitive
    }
  },
  "contactInfo": {
    "email": "encrypted_string",
    "phone": "encrypted_string"
  }
}

// Field-Level Encryption Strategy
const ENCRYPTED_FIELDS = [
  'passengers.*.firstName',
  'passengers.*.lastName',
  'passengers.*.passport.number',
  'contactInfo.email',
  'contactInfo.phone'
];
```

#### 9.2.2 API Security Headers
```javascript
// Security Headers Configuration
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": "default-src 'self'",
  "X-Rate-Limit-Remaining": "99",
  "X-Rate-Limit-Reset": "1643726000"
}
```

## 10. Performance Optimization

### 10.1 Database Optimization

#### 10.1.1 Query Optimization Strategy
```javascript
// Optimized Flight Search Query
db.flights.aggregate([
  {
    $match: {
      "route.origin.code": "BLR",
      "route.destination.code": "DEL",
      "schedule.departureTime": {
        $gte: ISODate("2025-08-15T00:00:00Z"),
        $lt: ISODate("2025-08-16T00:00:00Z")
      },
      "status": "ACTIVE"
    }
  },
  {
    $lookup: {
      from: "airlines",
      localField: "airline.code",
      foreignField: "code",
      as: "airlineDetails"
    }
  },
  {
    $project: {
      "flightNumber": 1,
      "route": 1,
      "schedule": 1,
      "pricing": 1,
      "aircraft": 1,
      "airline": { $arrayElemAt: ["$airlineDetails", 0] }
    }
  },
  {
    $sort: { "pricing.economy.totalPrice": 1 }
  },
  {
    $limit: 20
  }
]);
```

#### 10.1.2 Connection Pool Configuration
```javascript
// MongoDB Connection Pool Settings
const mongoOptions = {
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  useUnifiedTopology: true
};
```

### 10.2 Caching Optimization

#### 10.2.1 Multi-Level Caching Strategy
```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CACHING ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    L1 Cache     ┌─────────────────┐               │
│  │   Application   │◄───────────────▶│   In-Memory     │               │
│  │   Server        │   (Node Cache)  │   Cache         │               │
│  └─────────────────┘                 └─────────────────┘               │
│           │                                   │                        │
│           ▼                                   ▼                        │
│  ┌─────────────────┐    L2 Cache     ┌─────────────────┐               │
│  │   Redis         │◄───────────────▶│   Distributed   │               │
│  │   Cluster       │   (Shared)      │   Cache         │               │
│  └─────────────────┘                 └─────────────────┘               │
│           │                                   │                        │
│           ▼                                   ▼                        │
│  ┌─────────────────┐    L3 Cache     ┌─────────────────┐               │
│  │   MongoDB       │◄───────────────▶│   Database      │               │
│  │   Database      │   (Persistent)  │   Cache         │               │
│  └─────────────────┘                 └─────────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 10.2.2 Cache Warming Strategy
```javascript
// Preload Popular Routes
const POPULAR_ROUTES = [
  { origin: "BLR", destination: "DEL" },
  { origin: "BLR", destination: "BOM" },
  { origin: "DEL", destination: "BOM" }
];

// Cache Warming Job
async function warmCache() {
  for (const route of POPULAR_ROUTES) {
    const searchParams = {
      ...route,
      departureDate: new Date(Date.now() + 24*60*60*1000), // Tomorrow
      passengers: { adults: 1, children: 0, infants: 0 }
    };
    
    await searchFlights(searchParams);
  }
}
```

## 11. Monitoring and Observability

### 11.1 Metrics Collection

#### 11.1.1 Business Metrics
```javascript
// Key Performance Indicators
const BUSINESS_METRICS = {
  'flight_search_requests_total': {
    type: 'counter',
    help: 'Total number of flight search requests'
  },
  'flight_booking_success_rate': {
    type: 'histogram',
    help: 'Flight booking success rate percentage'
  },
  'average_search_response_time': {
    type: 'histogram',
    help: 'Average time to return search results'
  },
  'revenue_per_booking': {
    type: 'gauge',
    help: 'Average revenue generated per booking'
  }
};
```

#### 11.1.2 Technical Metrics
```javascript
// System Performance Metrics
const TECHNICAL_METRICS = {
  'api_request_duration_seconds': {
    type: 'histogram',
    help: 'API request duration in seconds',
    buckets: [0.1, 0.5, 1, 2, 5]
  },
  'database_connection_pool_active': {
    type: 'gauge',
    help: 'Number of active database connections'
  },
  'cache_hit_rate': {
    type: 'gauge',
    help: 'Cache hit rate percentage'
  },
  'external_api_error_rate': {
    type: 'counter',
    help: 'Rate of external API errors'
  }
};
```

### 11.2 Logging Strategy

#### 11.2.1 Structured Logging
```javascript
// Log Entry Structure
{
  "timestamp": "2025-07-29T10:30:00.123Z",
  "level": "INFO",
  "service": "flight-service",
  "traceId": "trace_123456",
  "spanId": "span_789",
  "userId": "user_123",
  "companyId": "comp_456",
  "operation": "flight_search",
  "message": "Flight search completed successfully",
  "metadata": {
    "searchParams": {...},
    "resultsCount": 45,
    "executionTime": 2.3,
    "cacheHit": false
  },
  "tags": ["search", "performance"]
}
```

#### 11.2.2 Log Levels and Categories
```javascript
// Logging Configuration
const LOG_CONFIG = {
  levels: {
    ERROR: 0,    // System errors, exceptions
    WARN: 1,     // Business logic warnings
    INFO: 2,     // General information
    DEBUG: 3     // Detailed debugging info
  },
  categories: {
    BUSINESS: "business_logic",
    SECURITY: "security_events", 
    PERFORMANCE: "performance_metrics",
    INTEGRATION: "external_api_calls"
  }
};
```

### 11.3 Health Checks

#### 11.3.1 Health Check Endpoints
```javascript
// GET /health
{
  "status": "healthy",
  "timestamp": "2025-07-29T10:30:00Z",
  "version": "1.2.3",
  "uptime": 86400,
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 12,
      "lastChecked": "2025-07-29T10:29:55Z"
    },
    "redis": {
      "status": "healthy", 
      "responseTime": 3,
      "lastChecked": "2025-07-29T10:29:55Z"
    },
    "external_apis": {
      "amadeus": {
        "status": "healthy",
        "responseTime": 145,
        "lastChecked": "2025-07-29T10:29:50Z"
      },
      "sabre": {
        "status": "degraded",
        "responseTime": 3500,
        "lastChecked": "2025-07-29T10:29:50Z"
      }
    }
  }
}
```

## 12. Deployment Architecture

### 12.1 Container Configuration

#### 12.1.1 Dockerfile
```dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S flight-service -u 1001

# Change ownership
RUN chown -R flight-service:nodejs /usr/src/app
USER flight-service

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3004/health || exit 1

CMD [ "node", "server.js" ]
```

#### 12.1.2 Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: flight-service
  namespace: ctms-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: flight-service
  template:
    metadata:
      labels:
        app: flight-service
    spec:
      containers:
      - name: flight-service
        image: flight-service:1.2.3
        ports:
        - containerPort: 3004
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: flight-service-secrets
              key: mongodb-uri
        - name: REDIS_URI
          valueFrom:
            secretKeyRef:
              name: flight-service-secrets
              key: redis-uri
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3004
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3004
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 12.2 Service Configuration

#### 12.2.1 Kubernetes Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: flight-service
  namespace: ctms-production
spec:
  selector:
    app: flight-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3004
  type: ClusterIP
```

#### 12.2.2 Horizontal Pod Autoscaler
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: flight-service-hpa
  namespace: ctms-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: flight-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 13. External API Integration

### 13.1 Amadeus API Integration

#### 13.1.1 Flight Search Integration
```javascript
// Amadeus API Client Configuration
class AmadeusClient {
  constructor() {
    this.baseURL = 'https://api.amadeus.com';
    this.clientId = process.env.AMADEUS_CLIENT_ID;
    this.clientSecret = process.env.AMADEUS_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async authenticate() {
    // OAuth2 client credentials flow
    const response = await axios.post(`${this.baseURL}/v1/security/oauth2/token`, {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret
    });
    
    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
  }

  async searchFlights(searchParams) {
    // Ensure valid token
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }

    const params = {
      originLocationCode: searchParams.origin,
      destinationLocationCode: searchParams.destination,
      departureDate: searchParams.departureDate,
      returnDate: searchParams.returnDate,
      adults: searchParams.passengers.adults,
      children: searchParams.passengers.children,
      infants: searchParams.passengers.infants,
      travelClass: searchParams.class,
      currencyCode: 'INR',
      max: 250
    };

    const response = await axios.get(`${this.baseURL}/v2/shopping/flight-offers`, {
      params,
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      },
      timeout: 30000
    });

    return this.transformAmadeusResponse(response.data);
  }

  transformAmadeusResponse(data) {
    return data.data.map(offer => ({
      flightId: offer.id,
      flightNumber: offer.itineraries[0].segments[0].carrierCode + 
                   offer.itineraries[0].segments[0].number,
      airline: {
        code: offer.itineraries[0].segments[0].carrierCode,
        name: this.getAirlineName(offer.itineraries[0].segments[0].carrierCode)
      },
      route: {
        origin: {
          code: offer.itineraries[0].segments[0].departure.iataCode,
          name: offer.itineraries[0].segments[0].departure.iataCode
        },
        destination: {
          code: offer.itineraries[0].segments[0].arrival.iataCode,
          name: offer.itineraries[0].segments[0].arrival.iataCode
        }
      },
      schedule: {
        departureTime: offer.itineraries[0].segments[0].departure.at,
        arrivalTime: offer.itineraries[0].segments[0].arrival.at,
        duration: offer.itineraries[0].duration
      },
      pricing: {
        economy: {
          basePrice: parseFloat(offer.price.base),
          taxes: parseFloat(offer.price.total) - parseFloat(offer.price.base),
          totalPrice: parseFloat(offer.price.total),
          availability: offer.numberOfBookableSeats
        }
      },
      provider: 'AMADEUS',
      externalId: offer.id
    }));
  }
}
```

#### 13.1.2 Circuit Breaker Pattern
```javascript
// Circuit Breaker Implementation
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  async call(fn, ...args) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

### 13.2 API Rate Limiting

#### 13.2.1 Rate Limiter Implementation
```javascript
// Redis-based Rate Limiter
class RateLimiter {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  async checkLimit(key, limit, window) {
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, window);
    }

    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetTime: Date.now() + (window * 1000)
    };
  }
}

// Usage in API calls
async function searchFlightsWithRateLimit(searchParams) {
  const rateLimitKey = `amadeus:search:${searchParams.origin}:${searchParams.destination}`;
  const rateLimit = await rateLimiter.checkLimit(rateLimitKey, 100, 3600); // 100 requests per hour

  if (!rateLimit.allowed) {
    throw new Error('Rate limit exceeded');
  }

  return await amadeusClient.searchFlights(searchParams);
}
```

## 14. Testing Strategy

### 14.1 Unit Testing

#### 14.1.1 Service Layer Tests
```javascript
// FlightSearchService Unit Tests
describe('FlightSearchService', () => {
  let flightSearchService;
  let mockAmadeusClient;
  let mockCacheRepository;

  beforeEach(() => {
    mockAmadeusClient = {
      searchFlights: jest.fn()
    };
    mockCacheRepository = {
      get: jest.fn(),
      set: jest.fn()
    };
    
    flightSearchService = new FlightSearchService(
      mockAmadeusClient,
      mockCacheRepository
    );
  });

  describe('searchFlights', () => {
    it('should return cached results when available', async () => {
      // Arrange
      const searchParams = {
        origin: 'BLR',
        destination: 'DEL',
        departureDate: '2025-08-15'
      };
      const cachedResults = [{ flightId: 'flight_123' }];
      
      mockCacheRepository.get.mockResolvedValue(cachedResults);

      // Act
      const result = await flightSearchService.searchFlights(searchParams);

      // Assert
      expect(result).toEqual(cachedResults);
      expect(mockAmadeusClient.searchFlights).not.toHaveBeenCalled();
    });

    it('should call external API when cache miss', async () => {
      // Arrange
      const searchParams = {
        origin: 'BLR',
        destination: 'DEL',
        departureDate: '2025-08-15'
      };
      const apiResults = [{ flightId: 'flight_456' }];
      
      mockCacheRepository.get.mockResolvedValue(null);
      mockAmadeusClient.searchFlights.mockResolvedValue(apiResults);

      // Act
      const result = await flightSearchService.searchFlights(searchParams);

      // Assert
      expect(result).toEqual(apiResults);
      expect(mockAmadeusClient.searchFlights).toHaveBeenCalledWith(searchParams);
      expect(mockCacheRepository.set).toHaveBeenCalled();
    });
  });
});
```

### 14.2 Integration Testing

#### 14.2.1 API Integration Tests
```javascript
// Flight API Integration Tests
describe('Flight API Integration', () => {
  let app;
  let testDb;

  beforeAll(async () => {
    // Setup test database
    testDb = await MongoMemoryServer.create();
    process.env.MONGODB_URI = testDb.getUri();
    
    // Initialize app
    app = require('../app');
  });

  afterAll(async () => {
    await testDb.stop();
  });

  describe('POST /api/v1/flights/search', () => {
    it('should return flight search results', async () => {
      // Arrange
      const searchRequest = {
        origin: 'BLR',
        destination: 'DEL',
        departureDate: '2025-08-15',
        passengers: { adults: 1, children: 0, infants: 0 },
        class: 'ECONOMY'
      };

      // Act
      const response = await request(app)
        .post('/api/v1/flights/search')
        .set('Authorization', `Bearer ${validToken}`)
        .send(searchRequest);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.flights).toBeInstanceOf(Array);
      expect(response.body.data.flights.length).toBeGreaterThan(0);
    });

    it('should return 400 for invalid search parameters', async () => {
      // Arrange
      const invalidRequest = {
        origin: 'INVALID',
        destination: 'DEL'
        // Missing required fields
      };

      // Act
      const response = await request(app)
        .post('/api/v1/flights/search')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidRequest);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

### 14.3 Performance Testing

#### 14.3.1 Load Testing Configuration
```javascript
// K6 Load Testing Script
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.1'],     // Error rate under 10%
  },
};

export default function() {
  const payload = JSON.stringify({
    origin: 'BLR',
    destination: 'DEL',
    departureDate: '2025-08-15',
    passengers: { adults: 1, children: 0, infants: 0 },
    class: 'ECONOMY'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.TEST_TOKEN}`,
    },
  };

  const response = http.post('http://api.example.com/api/v1/flights/search', payload, params);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
    'has flight results': (r) => JSON.parse(r.body).data.flights.length > 0,
  });

  sleep(1);
}
```

## 15. Migration and Rollback Strategy

### 15.1 Database Migration

#### 15.1.1 Schema Migration Scripts
```javascript
// Migration: Add new field to booking collection
const migration_001_add_loyalty_points = {
  up: async (db) => {
    await db.collection('bookings').updateMany(
      {},
      {
        $set: {
          'loyaltyPoints.earned': 0,
          'loyaltyPoints.redeemed': 0
        }
      }
    );
  },

  down: async (db) => {
    await db.collection('bookings').updateMany(
      {},
      {
        $unset: {
          'loyaltyPoints': ''
        }
      }
    );
  }
};
```

### 15.2 Blue-Green Deployment

#### 15.2.1 Deployment Pipeline
```yaml
# Blue-Green Deployment Configuration
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: flight-service-rollout
spec:
  replicas: 5
  strategy:
    blueGreen:
      activeService: flight-service-active
      previewService: flight-service-preview
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 30
      prePromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: flight-service-preview
      postPromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: flight-service-active
  selector:
    matchLabels:
      app: flight-service
  template:
    metadata:
      labels:
        app: flight-service
    spec:
      containers:
      - name: flight-service
        image: flight-service:{{.Values.image.tag}}
```

## Conclusion

This Low Level Design document provides a comprehensive blueprint for implementing the Flight Service microservice within the Corporate Travel Management System. The design emphasizes:

1. **Scalability**: Horizontal scaling capabilities with load balancing and caching strategies
2. **Reliability**: Circuit breaker patterns, error handling, and fallback mechanisms  
3. **Security**: Multi-layered security with authentication, authorization, and data encryption
4. **Performance**: Optimized database queries, multi-level caching, and efficient API design
5. **Observability**: Comprehensive monitoring, logging, and health checking
6. **Maintainability**: Clean architecture with clear separation of concerns

The design follows microservices best practices and provides a solid foundation for building a production-ready flight booking service that can handle enterprise-scale traffic while maintaining high availability and performance standards.