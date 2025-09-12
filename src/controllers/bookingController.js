import {createBookingService} from '../services/bookingService.js';
import AppError from '../utils/appError.js';

export const createBookingControllerFromAmadeus = async(req, res,next) => {
  try {
    const { flightDetails, passenger } = req.body;

    if (!flightDetails || !passenger || passenger.length === 0) {
      throw new AppError('Invalid data provided for booking creation',400);
  
    }
    const bookingResponse = await createBookingService(flightDetails, passenger);

    if (bookingResponse.success) {
      return res.status(200).json({
        success: true,
        data: bookingResponse.data
      });
    } else {
      throw new AppError(bookingResponse.error || 'Failed to create booking',500);
    }
  } catch (error) {
    next(error);
  }
}