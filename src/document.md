# Flight Service - API Documentation

## 📋 Table of Contents
1. [Service Overview](#service-overview)
2. [Booking Workflow](#booking-workflow)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Formats](#requestresponse-formats)
5. [Database Schema](#database-schema)
6. [Installation & Setup](#installation--setup)
7. [Usage Examples](#usage-examples)

---

## 🚀 Service Overview

### **Service Details**
- **Service Name**: Flight Service
- **Port**: 3004
- **Database**: MongoDB
- **Architecture**: RESTful API with Express.js
- **Language**: Node.js (ES6 Modules)

### **Core Functionality**
- Flight search with filtering and sorting
- Flight availability checking
- Multi-step booking workflow with Amadeus integration
- Real-time price confirmation
- Order creation with PNR generation
- Booking management and retrieval

---

## 🎯 Booking Workflow

### **Complete Flight Booking Process:**

1. **Flight Search** - User searches for available flights
2. **Flight Selection** - User selects specific flight offer
3. **Price Confirmation** - Confirm real-time pricing with Amadeus
4. **Payment Processing** - External payment service handles payment
5. **Order Creation** - Create order and generate PNR/ticket
6. **Booking Confirmation** - Retrieve booking details

---

## 📡 API Endpoints

### **Base URL**: `http://localhost:3004/api`

### **Flight Routes** (`/flights`):
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/flights/search` | Search for flights |
| GET | `/flights/:flightId/offer` | Get flight offer details |
| GET | `/flights/:flightId/availability` | Check flight availability |

### **Booking Routes** (`/bookings`):
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bookings/confirm-price` | **Step 3**: Confirm flight price |
| POST | `/bookings/create-order` | **Step 5**: Create order (called by payment service) |
| GET | `/bookings/bookings/:id` | Get booking details by ID |
| POST | `/bookings/book` | Legacy booking endpoint |

---

## 📄 Request/Response Formats

### **1. Flight Search**
#### **POST** `/api/flights/search`
```json
{
  "origin": "BLR",
  "destination": "DEL",
  "departureDate": "2025-08-17",
  "returnDate": "2025-08-20",
  "adults": 2,
  "children": 1,
  "infants": 0,
  "travelClass": "ECONOMY"
}
```

### **2. Flight Offer Details**
#### **GET** `/api/flights/:flightId/offer`
```json
{
  "success": true,
  "data": {
    "flightId": "1",
    "flightNumber": "QR573",
    "airline": { "code": "QR", "name": "Qatar Airways" },
    "route": {
      "origin": { "code": "BLR", "name": "Bangalore" },
      "destination": { "code": "DEL", "name": "Delhi" }
    },
    "schedule": {
      "departureTime": "2025-08-17T04:00:00Z",
      "arrivalTime": "2025-08-17T06:30:00Z",
      "duration": "PT2H30M"
    },
    "pricing": {
      "economy": {
        "basePrice": 45000,
        "taxes": 4500,
        "totalPrice": 49500,
        "availability": 5
      }
    }
  }
}
```

### **3. Price Confirmation (Step 3)**
#### **POST** `/api/bookings/confirm-price`
```json
{
  "flightOfferId": "1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "flightOfferId": "1",
    "confirmedPrice": {
      "total": "49500.00",
      "currency": "INR",
      "base": "45000.00",
      "taxes": "4500.00"
    },
    "pricingOptions": [...],
    "validUntil": "2025-01-15T12:00:00Z"
  }
}
```

### **4. Create Order (Step 5)**
#### **POST** `/api/bookings/create-order`
```json
{
  "flightOfferId": "1",
  "passengers": [
    {
      "type": "ADULT",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-15",
      "passportNumber": "A12345678",
      "passportExpiryDate": "2030-01-15",
      "passportIssueDate": "2020-01-15",
      "nationality": "IN"
    }
  ],
  "contactInfo": {
    "email": "john.doe@example.com",
    "phone": "+91-9876543210"
  },
  "paymentConfirmation": {
    "success": true,
    "transactionId": "TXN123456789",
    "amount": 49500,
    "currency": "INR"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "BK202501151234ABCD",
    "orderId": "AMADEUS_ORDER_123",
    "pnr": "ABC123",
    "status": "CONFIRMED",
    "totalPrice": 49500,
    "currency": "INR",
    "confirmationCode": "XYZ789"
  }
}
```

### **5. Get Booking Details**
#### **GET** `/api/bookings/bookings/:id`
```json
{
  "success": true,
  "data": {
    "bookingId": "BK202501151234ABCD",
    "status": "CONFIRMED",
    "flightDetails": {
      "outbound": {
        "flightNumber": "QR573",
        "route": "BLR → DEL",
        "schedule": {
          "departureTime": "2025-08-17T04:00:00Z",
          "arrivalTime": "2025-08-17T06:30:00Z"
        },
        "seat": null
      }
    },
    "passengers": [...],
    "pricing": {...},
    "payment": {...},
    "confirmationCode": "XYZ789"
  }
}
```

---

## 🗄️ Database Schema

### **Flight Collection**
```javascript
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
    "departureTime": "Date",
    "arrivalTime": "Date",
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
  "status": "String",
  "externalId": "String",
  "provider": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### **Booking Collection**
```javascript
{
  "_id": "ObjectId",
  "bookingId": "String",
  "userId": "String",
  "companyId": "String",
  "flightDetails": {
    "outbound": {
      "flightId": "String",
      "flightNumber": "String",
      "route": "Object",
      "schedule": "Object",
      "seatClass": "String",
      "seatNumber": "String"
    },
    "return": {
      "flightId": "String",
      "flightNumber": "String",
      "route": "Object",
      "schedule": "Object",
      "seatClass": "String",
      "seatNumber": "String"
    }
  },
  "passengers": [{
    "type": "String",
    "title": "String",
    "firstName": "String",
    "lastName": "String",
    "dateOfBirth": "Date",
    "passport": {
      "number": "String",
      "expiryDate": "Date",
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
    "method": "String",
    "status": "String",
    "transactionId": "String",
    "paidAt": "Date"
  },
  "status": "String",
  "confirmationCode": "String",
  "externalBookingRef": "String",
  "provider": "String",
  "metadata": {
    "bookedBy": "String",
    "approvedBy": "String",
    "reason": "String",
    "costCenter": "String",
    "amadeusOrderId": "String",
    "amadeusPnr": "String",
    "dataSource": "String"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### **Project Structure**
```
src/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── flightController.js # Flight search & availability
│   └── bookingController.js # Booking management
├── models/
│   ├── flights.js         # Flight schema
│   ├── bookings.js        # Booking schema
│   ├── searcheHistory.js  # Search history schema
│   └── modelsIndex.js     # Model exports
├── routes/
│   ├── flightRouter.js    # Flight routes
│   └── bookingRoutes.js   # Booking routes
├── services/
│   ├── flightService.js   # Flight business logic
│   ├── bookingService.js  # Booking business logic
│   └── amadeusApi.js      # Amadeus API integration
├── utils/
│   ├── pricingCalculator.js # Pricing logic
│   └── helpers.js         # Utility functions
|   |__ appError.js
├── middlewares/           # Middleware functions
│   ├── authMiddleware.js  # Authentication
│   └── errorHandling.js   # Error handling
├── validators/            # Input validation schemas
│   ├── searchParamValidation.js    # Flight input validation        # Entry point
├──     
└── app.js                
```

---

## 🔧 Integration with Payment Service

### **Payment Service Callback Flow:**

1. **Price Confirmation** → Flight Service confirms price
2. **Payment Processing** → Payment Service processes payment
3. **Order Creation** → Payment Service calls Flight Service with payment confirmation
4. **Booking Confirmation** → Flight Service creates order and returns booking details

### **Payment Service Integration:**
```javascript
// Payment service calls this endpoint after successful payment
POST /api/bookings/create-order
{
  "flightOfferId": "1",
  "passengers": [...],
  "contactInfo": {...},
  "paymentConfirmation": {
    "success": true,
    "transactionId": "TXN123456789",
    "amount": 49500,
    "currency": "INR"
  }
}
```

---

## 🚀 Usage Examples

### **Complete Booking Flow:**

1. **Search Flights:**
```bash
curl -X POST http://localhost:3004/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "BLR",
    "destination": "DEL",
    "departureDate": "2025-08-17",
    "adults": 2,
    "travelClass": "ECONOMY"
  }'
```

2. **Get Flight Offer:**
```bash
curl -X GET http://localhost:3004/api/flights/1/offer
```

3. **Confirm Price:**
```bash
curl -X POST http://localhost:3004/api/bookings/confirm-price \
  -H "Content-Type: application/json" \
  -d '{"flightOfferId": "1"}'
```

4. **Create Order (after payment):**
```bash
curl -X POST http://localhost:3004/api/bookings/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "flightOfferId": "1",
    "passengers": [...],
    "contactInfo": {...},
    "paymentConfirmation": {...}
  }'
```

5. **Get Booking Details:**
```bash
curl -X GET http://localhost:3004/api/bookings/bookings/BK202501151234ABCD
```

---

