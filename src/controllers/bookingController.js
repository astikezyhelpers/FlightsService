import { createBookingService, getBookingByIdService } from '../services/bookingService.js';
import { validateBookingRequest } from '../middleware/validation.js';

// POST /api/v1/flights/book
export const createBooking = async (req, res) => {
  try {
    // Validate booking request
    const validationResult = validateBookingRequest(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validationResult.message
        }
      });
    }

    // Create booking
    const booking = await createBookingService(req.body);
    
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
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: "BOOKING_ERROR",
        message: "Unable to create booking"
      }
    });
  }
};

// GET /api/v1/flights/bookings/:id
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