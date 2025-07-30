import { Booking } from '../models/modelsIndex.js';
import { calculatePricing } from '../utils/pricingCalculator.js';
import { generateBookingId, generateConfirmationCode } from '../utils/helpers.js';

// Create booking service function
export const createBookingService = async (bookingData) => {
  try {
    const {
      searchId,
      flightSelection,
      passengers,
      contactInfo,
      paymentMethod,
      businessJustification
    } = bookingData;

    // Calculate pricing
    const pricing = await calculatePricing(flightSelection, passengers);

    // Generate booking ID and confirmation code
    const bookingId = generateBookingId();
    const confirmationCode = generateConfirmationCode();

    // Create booking object
    const booking = {
      bookingId,
      userId: "user_123", // From auth middleware
      companyId: "comp_456", // From auth middleware
      flightDetails: {
        outbound: {
          flightId: flightSelection.outbound.flightId,
          flightNumber: flightSelection.outbound.flightNumber,
          route: flightSelection.outbound.route,
          schedule: flightSelection.outbound.schedule,
          seatClass: flightSelection.outbound.class,
          seatNumber: null // Will be assigned later
        }
      },
      passengers,
      pricing,
      payment: {
        method: paymentMethod,
        status: 'PENDING'
      },
      status: 'CONFIRMED',
      confirmationCode,
      metadata: {
        bookedBy: "user_123",
        reason: businessJustification
      }
    };

    // Add return flight if exists
    if (flightSelection.return) {
      booking.flightDetails.return = {
        flightId: flightSelection.return.flightId,
        flightNumber: flightSelection.return.flightNumber,
        route: flightSelection.return.route,
        schedule: flightSelection.return.schedule,
        seatClass: flightSelection.return.class,
        seatNumber: null
      };
    }

    // Save to database
    const savedBooking = await Booking.create(booking);

    return savedBooking;

  } catch (error) {
    console.error('Booking service error:', error);
    throw error;
  }
};

// Get booking by ID service function
export const getBookingByIdService = async (bookingId) => {
  try {
    const booking = await Booking.findOne({ bookingId })
      .populate('flightDetails.outbound.flightId')
      .populate('flightDetails.return.flightId');

    if (!booking) {
      return null;
    }

    // Format response
    return {
      bookingId: booking.bookingId,
      status: booking.status,
      flightDetails: {
        outbound: {
          flightNumber: booking.flightDetails.outbound.flightNumber,
          route: `${booking.flightDetails.outbound.route.origin.code} → ${booking.flightDetails.outbound.route.destination.code}`,
          schedule: {
            departureTime: booking.flightDetails.outbound.schedule.departureTime,
            arrivalTime: booking.flightDetails.outbound.schedule.arrivalTime
          },
          seat: booking.flightDetails.outbound.seatNumber
        }
      },
      passengers: booking.passengers,
      pricing: booking.pricing,
      payment: booking.payment,
      confirmationCode: booking.confirmationCode
    };

  } catch (error) {
    console.error('Get booking service error:', error);
    throw error;
  }
};