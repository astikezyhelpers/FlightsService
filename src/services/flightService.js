import {
  searchAmadeusFlights,
  getFlightOfferPrices,
  getFlightDetailsByOfferId
} from './amadeusApi.js'

export const FlightOfferService = async (params)=>{
  try{
    if(!params){
      return 'Invalid Data Entered'
    }
    const flights = await searchAmadeusFlights(params)
    if(!flights){
      return 'Failed To Fetch flights for selected Destination Location'
    }
    return flights
  }catch(err){
    return err.message
  }

}
export const FlightPriceOfferService = async (flightDetails)=>{
  try{
    if(!flightDetails){
      return 'Invalid Data Entered'
    }
    const flightPrice = await getFlightOfferPrices(flightDetails)
    console.log('Flight Price:',flightPrice)
    if(!flightPrice){
      return 'Failed To Fetch flight prices for selected Flight Offer'
    }
    return flightPrice
  }catch(err){
    return err.message
  }
}

export const getFlightDetailsByFlightOfferId = async(flightOfferId)=>{
  try{
    if(!flightOfferId){
      return 'Invalid Flight Offer Id'
    }
    const flightDetails = await getFlightDetailsByOfferId(flightOfferId)
    if(!flightDetails){
      return 'Failed To Fetch flight details for selected Flight Offer Id'
    }
    return flightDetails
  }catch(err){
    return err.message
  }
}
