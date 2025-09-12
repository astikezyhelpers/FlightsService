import {createFlightOrder} from './amadeusApi.js';

//Create Booking Service 

export const createBookingService = async (flightDetails,passenger) => {
  try {
    if (!flightDetails || !passenger || passenger.length === 0) {
      return 'Invalid data provided for booking creation';
    }

 

    
    const orderResponse = await createFlightOrder(flightDetails, passenger);

    if (!orderResponse.success) {
      return 'Failed to create flight order'
    }

    return {
      success: true,
      data: orderResponse.data
    };

  } catch (error) {
    console.error(' Booking creation error:', error.orderResponse.message || error.message);
    return {
      success: false,
      error: error.orderResponse?.message
    };
  }
}
