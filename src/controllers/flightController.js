import {
  FlightOfferService,
  FlightPriceOfferService,
} from '../services/flightService.js'
import AppError from '../utils/appError.js';
import { flightSearchSchema } from "../validation/searchParamValidation.js"; 
import {transeformedFlight} from '../utils/helpers.js';
import logger from '../../logger.js';

export const flightsOfferController = async (req,res,next)=>{
  try{
    const body = req.body
    if(!body){
      throw new AppError('No data provided',400)
    
    }
    const { error } = flightSearchSchema.validate(body);
    if (error) {
      throw new AppError(`Validation error: ${error.details.map(x => x.message).join(', ')}`, 400);
    }

    const seachQuery = {}
    for(const key in body){
      seachQuery[key] = body[key]

    }
 
    const flightOffers = await FlightOfferService(seachQuery)
    if(!flightOffers || flightOffers.success === false){
      throw new AppError('Failed to fetch flight offers please try again after some time or contact support team',500)
    }
    logger.info('Flight Offers:',flightOffers)
   
    const transformnedFlightOffers = transeformedFlight(flightOffers)
   
    return res.status(200).json({
      sucess: true,
      data: transformnedFlightOffers,
      flightOffers
    })


  }catch(err){
    next(err)
  }
   

} 

export const flightPriceOfferController = async (req,res,next)=>{
  try{
    const body = req.body

    if(!body){
      throw new AppError('No data provided',400)
   
    }
    const confirmationOffer = await FlightPriceOfferService(body)
    if(!confirmationOffer){
      throw new AppError('Failed to fetch flight offer prices please try again after some time or contact support team',500)
    }
    if (confirmationOffer.success === false){
      throw new AppError(confirmationOffer.error || 'Failed to fetch flight offer prices please try again after some time or contact support team',500)
     
    }else if(confirmationOffer.data.warnings && confirmationOffer.data.warnings.length > 0){
      throw new AppError(confirmationOffer.data.warnings[0].detail || 'Failed to fetch flight offer prices please try again after some time or contact support team',400) 
    }
    
    return res.status(200).json({
      sucess: true,
      data: confirmationOffer
    })
    
  }catch(err){
    next(err)
  
  }
}

