import {Flight,Booking,SearchHistory} from "../models/modelsIndex.js";
import { getMockFlights } from '../utils/mockData.js';

// Search flights service function
export const searchFlightsService = async (searchParams) => {
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    adults = 1,
    children = 0,
    infants = 0,
    class: travelClass = 'ECONOMY',
    directFlights = false,
    maxStops = 2,
    preferredAirlines,
    sortBy = 'price',
    sortOrder = 'asc',
    page = 1,
    limit = 20
  } = searchParams;

  try {
    // For now, use mock data (later replace with database query)
    let flights = getMockFlights();

    // Apply filters
    flights = filterFlights(flights, {
      origin,
      destination,
      departureDate,
      directFlights,
      preferredAirlines
    });

    // Apply sorting
    flights = sortFlights(flights, sortBy, sortOrder, travelClass);

    // Apply pagination
    const paginatedFlights = paginateFlights(flights, page, limit);

    return {
      searchId: `search_${Date.now()}`,
      flights: paginatedFlights,
      totalResults: flights.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(flights.length / limit),
        hasNext: page < Math.ceil(flights.length / limit),
        hasPrev: page > 1
      },
      searchCriteria: {
        origin,
        destination,
        departureDate,
        returnDate,
        passengers: { adults, children, infants },
        class: travelClass
      }
    };

  } catch (error) {
    console.error('Search service error:', error);
    throw error;
  }
};

// Get flight availability service function
export const getFlightAvailabilityService = async (flightId, date, travelClass) => {
  try {
    // For now, use mock data (later replace with database query)
    const mockFlights = getMockFlights();
    const flight = mockFlights.find(f => f.flightId === flightId);
    
    if (!flight) {
      throw new Error('Flight not found');
    }

    const availability = flight.pricing[travelClass.toLowerCase()]?.availability || 0;

    return {
      flightId,
      date,
      availability: {
        [travelClass.toLowerCase()]: availability
      },
      seatMap: {
        rows: 30,
        seatsPerRow: 6,
        availableSeats: availability > 0 ? ["1A", "1B", "2C"] : []
      }
    };

  } catch (error) {
    console.error('Availability service error:', error);
    throw error;
  }
};

// Helper functions
const filterFlights = (flights, filters) => {
  return flights.filter(flight => {
    // Route matching
    const routeMatch = flight.route.origin.code === filters.origin.toUpperCase() &&
                      flight.route.destination.code === filters.destination.toUpperCase();
    
    if (!routeMatch) return false;

    // Date matching
    if (filters.departureDate) {
      const departureDateObj = new Date(filters.departureDate);
      const flightDate = new Date(flight.schedule.departureTime);
      const dateMatch = flightDate.toDateString() === departureDateObj.toDateString();
      if (!dateMatch) return false;
    }

    // Direct flights filter
    if (filters.directFlights === 'true' && flight.stops !== 0) {
      return false;
    }

    // Preferred airlines filter
    if (filters.preferredAirlines) {
      const airlines = filters.preferredAirlines.split(',');
      if (!airlines.includes(flight.airline.code)) {
        return false;
      }
    }

    return true;
  });
};

const sortFlights = (flights, sortBy, sortOrder, travelClass) => {
  return flights.sort((a, b) => {
    if (sortBy === 'price') {
      const priceA = a.pricing[travelClass.toLowerCase()]?.totalPrice || 0;
      const priceB = b.pricing[travelClass.toLowerCase()]?.totalPrice || 0;
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    } else if (sortBy === 'duration') {
      return sortOrder === 'asc' ? a.schedule.duration - b.schedule.duration : b.schedule.duration - a.schedule.duration;
    }
    return 0;
  });
};

const paginateFlights = (flights, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  return flights.slice(startIndex, endIndex);
};
