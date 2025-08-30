# Flight Service - API Documentation

## 📋 Table of Contents
1. [Service Overview](#service-overview)
2. [API Endpoints](#api-endpoints)
3. [Request/Response Formats](#requestresponse-formats)
4. [Database Schema](#database-schema)
5. [Installation & Setup](#installation--setup)
6. [Usage Examples](#usage-examples)

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
- Booking creation and management
- Pricing calculation for multiple passengers
- Mock data integration (ready for external APIs)

---

## 📡 API Endpoints

### **Base URL**: `http://localhost:3004/api/flights`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search` | Search for flights |
| GET | `/:flightId/availability` | Check flight availability |
| POST | `/book` | Create a new booking |
| GET | `/bookings/:id` | Get booking details |

---

## 📄 Request/Response Formats

### **1. Flight Search**

#### **GET** `/api/flights/search`



### **2. Flight Availability**

#### **GET** `/api/flights/:flightId/availability`

```

### **3. Create Booking**

#### **POST** `/api/flights/book`


### **4. Get Booking Details**

#### **GET** `/api/flights/bookings/:id`


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
    "costCenter": "String"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

```

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
│   └── bookingService.js  # Booking business logic
├── utils/
│   ├── mockData.js        # Mock flight data
│   ├── pricingCalculator.js # Pricing logic
│   └── helpers.js         # Utility functions
├── middleware/
│   └── validation.js      # Request validation
└── app.js                 # Express server setup
```

---

