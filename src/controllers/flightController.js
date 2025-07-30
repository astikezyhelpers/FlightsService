import { searchFlightsService, getFlightAvailabilityService } from '../services/flightService.js';
//import { validateSearchParams } from '../middleware/validation.js';

// GET /api/v1/flights/search
export const searchFlights = async (req, res) => {
  try {
    // Validate request parameters
    // const validationResult = validateSearchParams(req.query);
    // if (!validationResult.isValid) {
    //   return res.status(400).json({
    //     success: false,
    //     error: {
    //       code: "VALIDATION_ERROR",
    //       message: validationResult.message
    //     }
    //   });
    // }

    // Call service function
    const result = await searchFlightsService(req.query);
    
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