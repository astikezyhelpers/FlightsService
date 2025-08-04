import { createBookingService, getBookingByIdService } from '../services/bookingService.js';

// POST /api/v1/flights/book
export const createBooking = async (req, res) => {
  try {
    console.log('📥 Request body received:', req.body);
    console.log('📥 Request body type:', typeof req.body);
    console.log('📥 Request body keys:', Object.keys(req.body));
    
    const {
      flightId,
      passengers,
      contactInfo,
      travelClass,
      departureDate,
      returnFlightId,
      returnDate
    } = req.body;

    // Validate required fields
    if (!flightId || !passengers || !contactInfo || !travelClass || !departureDate) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_REQUIRED_FIELDS",
          message: "Missing required fields: flightId, passengers, contactInfo, travelClass, departureDate"
        }
      });
    }

    // Structure the data as expected by the service
    const bookingData = {
      flightSelection: {
        outbound: {
          flightId: flightId,
          class: travelClass,
          departureDate: departureDate
        }
      },
      passengers: {
        adults: passengers.filter(p => p.type === 'ADULT').length,
        children: passengers.filter(p => p.type === 'CHILD').length,
        infants: passengers.filter(p => p.type === 'INFANT').length
      },
      passengerDetails: passengers,
      contactInfo: contactInfo,
      paymentMethod: 'CREDIT_CARD', // Default payment method
      businessJustification: null
    };

    console.log('📤 Structured booking data:', JSON.stringify(bookingData, null, 2));

    // Add return flight if provided
    if (returnFlightId && returnDate) {
      bookingData.flightSelection.return = {
        flightId: returnFlightId,
        class: travelClass,
        departureDate: returnDate
      };
    }

    // Create booking
    console.log('🚀 Calling service with params:', bookingData);
    const booking = await createBookingService(bookingData);
    
    res.status(201).json({
      success: true,
      data: {
        bookingId: booking.bookingId,
        status: booking.status,
        confirmationCode: booking.confirmationCode,
        totalPrice: booking.pricing.totalPrice,
        currency: booking.pricing.currency,
        expiresAt: booking.expiresAt
      }
    });

  } catch (error) {
    console.error('❌ Booking creation error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: {
        code: "BOOKING_ERROR",
        message: "Unable to create booking"
      }
    });
  }
};


export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await getBookingByIdService(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: "BOOKING_NOT_FOUND",
          message: "Booking not found"
        }
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: "BOOKING_ERROR",
        message: "Unable to retrieve booking"
      }
    });
  }
};