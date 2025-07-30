import { getMockFlights } from './mockData.js';

// Calculate pricing for booking
export const calculatePricing = async (flightSelection, passengers) => {
  try {
    let totalBasePrice = 0;
    let totalTaxes = 0;
    let totalFees = 0;

    // Calculate outbound flight pricing
    const outboundPricing = await calculateFlightPricing(
      flightSelection.outbound.flightId,
      flightSelection.outbound.class,
      passengers
    );

    totalBasePrice += outboundPricing.basePrice;
    totalTaxes += outboundPricing.taxes;
    totalFees += outboundPricing.fees;

    // Calculate return flight pricing (if exists)
    if (flightSelection.return) {
      const returnPricing = await calculateFlightPricing(
        flightSelection.return.flightId,
        flightSelection.return.class,
        passengers
      );

      totalBasePrice += returnPricing.basePrice;
      totalTaxes += returnPricing.taxes;
      totalFees += returnPricing.fees;
    }

    // Apply business markup (if corporate booking)
    const markup = calculateBusinessMarkup(totalBasePrice);

    const totalPrice = totalBasePrice + totalTaxes + totalFees + markup;

    return {
      basePrice: totalBasePrice,
      taxes: totalTaxes,
      fees: totalFees,
      markup: markup,
      totalPrice: totalPrice,
      currency: "INR"
    };

  } catch (error) {
    console.error('Pricing calculation error:', error);
    throw error;
  }
};

// Calculate pricing for a single flight
const calculateFlightPricing = async (flightId, seatClass, passengers) => {
  // Get flight data (for now from mock, later from database)
  const flights = getMockFlights();
  const flight = flights.find(f => f.flightId === flightId);

  if (!flight) {
    throw new Error('Flight not found');
  }

  const flightPricing = flight.pricing[seatClass.toLowerCase()];
  if (!flightPricing) {
    throw new Error(`Pricing not available for ${seatClass} class`);
  }

  // Calculate passenger-specific pricing
  let basePrice = 0;
  let taxes = 0;
  let fees = 0;

  // Adult pricing
  basePrice += flightPricing.basePrice * passengers.adults;
  taxes += flightPricing.taxes * passengers.adults;

  // Child pricing (50% of adult fare)
  if (passengers.children > 0) {
    basePrice += (flightPricing.basePrice * 0.5) * passengers.children;
    taxes += (flightPricing.taxes * 0.5) * passengers.children;
  }

  // Infant pricing (10% of adult fare)
  if (passengers.infants > 0) {
    basePrice += (flightPricing.basePrice * 0.1) * passengers.infants;
    taxes += (flightPricing.taxes * 0.1) * passengers.infants;
  }

  // Booking fees
  fees = 200 * (passengers.adults + passengers.children); // No fee for infants

  return {
    basePrice,
    taxes,
    fees
  };
};

// Calculate business markup
const calculateBusinessMarkup = (basePrice) => {
  // 5% markup for corporate bookings
  return basePrice * 0.05;
};

// Calculate taxes based on route
const calculateTaxes = (basePrice, origin, destination) => {
  // GST calculation (18%)
  const gst = basePrice * 0.18;
  
  // Airport taxes (varies by airport)
  const airportTax = getAirportTax(origin, destination);
  
  return gst + airportTax;
};

// Get airport tax based on route
const getAirportTax = (origin, destination) => {
  // Simplified airport tax calculation
  const airportTaxes = {
    'BLR': 200,
    'DEL': 300,
    'BOM': 250,
    'MAA': 180
  };

  const originTax = airportTaxes[origin] || 200;
  const destinationTax = airportTaxes[destination] || 200;

  return originTax + destinationTax;
};