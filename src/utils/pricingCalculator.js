import { searchAmadeusFlights } from '../services/amadeusApi.js';

// Calculate pricing for booking
export const calculatePricing = async (flightDetails) => {
  try {
    // Validate input
    if (!flightDetails || !flightDetails.outbound) {
      throw new Error('Invalid flight details for pricing calculation');
    }

    // Log the data being processed
    console.log('💰 Calculating pricing for:', JSON.stringify(flightDetails, null, 2));

    // Calculate outbound flight pricing
    const outboundPricing = await calculateFlightPricing(
      flightDetails.outbound.flightId,
      flightDetails.outbound.class,
      flightDetails.passengers
    );

    // Calculate return flight pricing (if exists)
    let returnPricing;
    if (flightDetails.return) {
      returnPricing = await calculateFlightPricing(
        flightDetails.return.flightId,
        flightDetails.return.class,
        flightDetails.passengers
      );
    }

    // Combine pricing data
    const pricingData = combinePricingData(outboundPricing, returnPricing, flightDetails.passengers);

    // Apply business markup (if corporate booking)
    const markup = calculateBusinessMarkup(pricingData.basePrice);

    const totalPrice = pricingData.basePrice + pricingData.taxes + pricingData.fees + markup;

    return {
      basePrice: pricingData.basePrice,
      taxes: pricingData.taxes,
      fees: pricingData.fees,
      markup: markup,
      totalPrice: totalPrice,
      currency: "INR"
    };

  } catch (error) {
    console.error(' Pricing calculation error:', error);
    throw error;
  }
};

// Calculate pricing for a single flight
const calculateFlightPricing = async (flightId, seatClass, passengers) => {
  try {
    if (!flightId) {
      throw new Error('Flight ID is required for pricing calculation');
    }

    if (!passengers || typeof passengers !== 'object') {
      throw new Error('Valid passengers object is required');
    }

    // Get flight data from Amadeus API
    const searchResult = await searchAmadeusFlights({
      origin: 'BLR', // Default search to get test data
      destination: 'DEL',
      departureDate: '2025-08-17',
      adults: 1,
      children: 0,
      infants: 0,
      class: seatClass || 'ECONOMY'
    });
    
    if (!searchResult || !searchResult.data) {
      throw new Error('Failed to retrieve flight data from Amadeus');
    }

    const flight = searchResult.data.find(f => f.amadeusOfferId === flightId);

    if (!flight) {
      throw new Error(`Flight with ID "${flightId}" not found`);
    }

    if (!flight.pricing) {
      throw new Error('Flight pricing data is not available');
    }

    // Safely access pricing with multiple fallback options
    const pricingKey = seatClass?.toLowerCase() || 'economy';
    const flightPricing = flight.pricing[pricingKey] || 
                         flight.pricing.economy || 
                         flight.pricing.economy_class || 
                         flight.pricing.ECONOMY;

    if (!flightPricing) {
      throw new Error(`Pricing not available for ${seatClass || 'economy'} class`);
    }

    // Validate pricing data
    if (typeof flightPricing.basePrice !== 'number' || flightPricing.basePrice < 0) {
      throw new Error('Invalid base price in flight pricing data');
    }

    // Calculate passenger-specific pricing
    let basePrice = 0;
    let taxes = 0;
    let fees = 0;

    // Adult pricing
    const adults = passengers.adults || 0;
    basePrice += flightPricing.basePrice * adults;
    taxes += (flightPricing.taxes || 0) * adults;

    // Child pricing (50% of adult fare)
    const children = passengers.children || 0;
    if (children > 0) {
      basePrice += (flightPricing.basePrice * 0.5) * children;
      taxes += ((flightPricing.taxes || 0) * 0.5) * children;
    }

    // Infant pricing (10% of adult fare)
    const infants = passengers.infants || 0;
    if (infants > 0) {
      basePrice += (flightPricing.basePrice * 0.1) * infants;
      taxes += ((flightPricing.taxes || 0) * 0.1) * infants;
    }

    // Booking fees
    fees = 200 * (adults + children); // No fee for infants

    return {
      basePrice,
      taxes,
      fees
    };
  } catch (error) {
    console.error('❌ Flight pricing calculation error:', error);
    throw error;
  }
};

// Combine outbound and return flight pricing data
const combinePricingData = (outboundPricing, returnPricing, passengers) => {
  try {
    if (!outboundPricing) {
      throw new Error('Outbound flight pricing is required');
    }

    let totalBasePrice = outboundPricing.basePrice || 0;
    let totalTaxes = outboundPricing.taxes || 0;
    let totalFees = outboundPricing.fees || 0;

    if (returnPricing) {
      totalBasePrice += returnPricing.basePrice || 0;
      totalTaxes += returnPricing.taxes || 0;
      totalFees += returnPricing.fees || 0;
    }

    // Calculate GST (18%)
    const gst = totalBasePrice * 0.18;
    totalTaxes += gst;

    // Calculate airport taxes
    const originAirportTax = getAirportTax('BLR');
    const destinationAirportTax = getAirportTax('DEL');
    totalTaxes += originAirportTax + destinationAirportTax;

    return {
      basePrice: totalBasePrice,
      taxes: totalTaxes,
      fees: totalFees
    };
  } catch (error) {
    console.error('❌ Error combining pricing data:', error);
    throw error;
  }
};

// Calculate business markup
const calculateBusinessMarkup = (basePrice) => {
  try {
    if (typeof basePrice !== 'number' || basePrice < 0) {
      throw new Error('Invalid base price for markup calculation');
    }
    // 5% markup for corporate bookings
    return basePrice * 0.05;
  } catch (error) {
    console.error('❌ Error calculating business markup:', error);
    return 0; // Return 0 markup on error
  }
};

// Get airport tax based on route
const getAirportTax = (airportCode) => {
  try {
    if (!airportCode) {
      return 200; // Default tax
    }

    // Simplified airport tax calculation
    const airportTaxes = {
      'BLR': 200,
      'DEL': 300,
      'BOM': 250,
      'MAA': 180,
      'HYD': 150,
      'CCU': 220,
      'COK': 180,
      'GOI': 160
    };

    return airportTaxes[airportCode.toUpperCase()] || 200;
  } catch (error) {
    console.error('❌ Error getting airport tax:', error);
    return 200; // Default tax on error
  }
};