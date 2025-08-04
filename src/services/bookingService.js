import { Booking } from '../models/modelsIndex.js';
import { calculatePricing } from '../utils/pricingCalculator.js';
import { generateBookingId, generateConfirmationCode } from '../utils/helpers.js';
import { getMockFlights } from '../utils/mockData.js';

// Create booking service function
export const createBookingService = async (bookingData) => {
  try {
    console.log('🔧 Booking service received data:', JSON.stringify(bookingData, null, 2));
    
    const {
      flightSelection,
      passengers,
      passengerDetails,
      contactInfo,
      paymentMethod,
      businessJustification
    } = bookingData;

    console.log('🔧 Extracted flightSelection:', flightSelection);
    console.log('🔧 Extracted passengers:', passengers);
    console.log('🔧 Extracted passengerDetails:', passengerDetails);

    // Get flight details from mock data
    const flights = getMockFlights();
    console.log('🔧 Available flights:', flights.map(f => f.flightId));
    
    const outboundFlight = flights.find(f => f.flightId === flightSelection.outbound.flightId);
    console.log('🔧 Found outbound flight:', outboundFlight ? outboundFlight.flightId : 'NOT FOUND');
    
    if (!outboundFlight) {
      throw new Error('Outbound flight not found');
    }

    // Calculate pricing
    console.log('🔧 Calculating pricing...');
    const pricing = await calculatePricing(flightSelection, passengers);
    console.log('🔧 Pricing calculated:', pricing);

    // Generate booking ID and confirmation code
    const bookingId = generateBookingId();
    const confirmationCode = generateConfirmationCode();
    console.log('🔧 Generated bookingId:', bookingId);
    console.log('🔧 Generated confirmationCode:', confirmationCode);

    // Map passenger details to match schema
    const mappedPassengers = passengerDetails.map(passenger => ({
      type: passenger.type,
      title: 'Mr', // Default title, can be enhanced later
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      dateOfBirth: new Date(passenger.dateOfBirth),
      passport: {
        number: passenger.passportNumber,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default expiry 1 year from now
        country: passenger.nationality
      },
      specialRequests: []
    }));

    console.log('🔧 Mapped passengers:', mappedPassengers);

    // Create booking object
    const booking = {
      bookingId,
      userId: "user_123", // From auth middleware
      companyId: "comp_456", // From auth middleware
      flightDetails: {
        outbound: {
          flightId: outboundFlight.flightId, // Use string ID for mock data
          flightNumber: outboundFlight.flightNumber,
          route: outboundFlight.route,
          schedule: {
            departureTime: new Date(outboundFlight.schedule.departureTime),
            arrivalTime: new Date(outboundFlight.schedule.arrivalTime),
            duration: outboundFlight.schedule.duration
          },
          seatClass: flightSelection.outbound.class,
          seatNumber: null // Will be assigned later
        }
      },
      passengers: mappedPassengers,
      pricing,
      contactInfo,
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

    console.log('🔧 Created booking object:', JSON.stringify(booking, null, 2));

    // Add return flight if exists
    if (flightSelection.return) {
      const returnFlight = flights.find(f => f.flightId === flightSelection.return.flightId);
      
      if (!returnFlight) {
        throw new Error('Return flight not found');
      }

      booking.flightDetails.return = {
        flightId: returnFlight.flightId, // Use string ID for mock data
        flightNumber: returnFlight.flightNumber,
        route: returnFlight.route,
        schedule: {
          departureTime: new Date(returnFlight.schedule.departureTime),
          arrivalTime: new Date(returnFlight.schedule.arrivalTime),
          duration: returnFlight.schedule.duration
        },
        seatClass: flightSelection.return.class,
        seatNumber: null
      };
    }

    // Save to database
    console.log('🔧 Saving to database...');
    const savedBooking = await Booking.create(booking);
    console.log('🔧 Booking saved successfully:', savedBooking.bookingId);

    return savedBooking;

  } catch (error) {
    console.error('❌ Booking service error:', error);
    console.error('❌ Error stack:', error.stack);
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