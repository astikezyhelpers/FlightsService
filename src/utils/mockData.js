export const getMockFlights = () => {
    return [
      {
        flightId: "flight_789",
        flightNumber: "6E2043",
        airline: { 
          code: "6E", 
          name: "IndiGo" 
        },
        route: {
          origin: { 
            code: "BLR", 
            name: "Bengaluru",
            city: "Bengaluru",
            country: "India"
          },
          destination: { 
            code: "DEL", 
            name: "Delhi",
            city: "Delhi", 
            country: "India"
          }
        },
        schedule: {
          departureTime: "2025-08-15T06:30:00Z",
          arrivalTime: "2025-08-15T09:15:00Z",
          duration: 165
        },
        pricing: {
          economy: {
            basePrice: 4500,
            taxes: 890,
            totalPrice: 5390,
            availability: 9
          },
          business: {
            basePrice: 12000,
            taxes: 2100,
            totalPrice: 14100,
            availability: 3
          }
        },
        stops: 0,
        aircraft: "A320",
        amenities: ["WIFI", "MEAL"]
      },
      {
        flightId: "flight_790",
        flightNumber: "AI101",
        airline: { 
          code: "AI", 
          name: "Air India" 
        },
        route: {
          origin: { 
            code: "BLR", 
            name: "Bengaluru",
            city: "Bengaluru",
            country: "India"
          },
          destination: { 
            code: "DEL", 
            name: "Delhi",
            city: "Delhi", 
            country: "India"
          }
        },
        schedule: {
          departureTime: "2025-08-15T08:00:00Z",
          arrivalTime: "2025-08-15T10:45:00Z",
          duration: 165
        },
        pricing: {
          economy: {
            basePrice: 5200,
            taxes: 950,
            totalPrice: 6150,
            availability: 12
          },
          business: {
            basePrice: 15000,
            taxes: 2500,
            totalPrice: 17500,
            availability: 5
          }
        },
        stops: 0,
        aircraft: "B787",
        amenities: ["WIFI", "MEAL", "ENTERTAINMENT"]
      }
    ];
  };