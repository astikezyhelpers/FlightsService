import { searchFlightsService, getFlightAvailabilityService } from '../services/flightService.js';

// POST /api/v1/flights/search (with request body)
export const searchFlights = async (req, res) => {
  try {
    // Get search parameters from request body
    const searchParams = req.body;
    
    console.log('📥 Request body received:', searchParams);
    console.log('📥 Request body type:', typeof searchParams);
    console.log('📥 Request body keys:', Object.keys(searchParams || {}));
    
    // Check if request body is provided
    if (!searchParams || Object.keys(searchParams).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_BODY",
          message: "Request body is required for flight search"
        }
      });
    }
    
    console.log('🚀 Calling service with params:', searchParams);
    // Call service function
    const result = await searchFlightsService(searchParams);
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: "SEARCH_ERROR",
        message: "Unable to process search request"
      }
    });
  }
};

// GET /api/v1/flights/:flightId/availability
export const getFlightAvailability = async (req, res) => {
  try {
    const { flightId } = req.params;
    const { date, class: travelClass = 'ECONOMY' } = req.query;

    const result = await getFlightAvailabilityService(flightId, date, travelClass);
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Availability error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: "AVAILABILITY_ERROR",
        message: "Unable to check availability"
      }
    });
  }
};