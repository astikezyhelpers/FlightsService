import dotenv from 'dotenv';
import logger from '../../logger.js'
dotenv.config({path:'../../.env'})
import axios from 'axios';
import {passengerDetails} from '../utils/helpers.js';


// Amadeus API configuration
const AMADEUS_BASE_URL = 'https://test.api.amadeus.com';
let accessToken = null;
let tokenExpiry = null;

// Get OAuth2 access token
export const authenticateAmadeus = async () => {
  try {
    logger.info(' Authenticating with Amadeus API...');



    logger.info(process.env.AMADEUS_CLIENT_ID,process.env.AMADEUS_CLIENT_SECRET);
    const response = await axios.post(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_CLIENT_ID,
      client_secret: process.env.AMADEUS_CLIENT_SECRET
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    logger.info(' Token acquired, expires at:', new Date(tokenExpiry).toISOString(),accessToken);
    
    logger.info(' Amadeus authentication successful',accessToken);
    return accessToken;

  } catch (error) {
    console.error(' Amadeus authentication failed:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Amadeus API');
  }
};


// Ensure valid token before making requests
export const ensureValidToken = async () => {
  if (!accessToken || Date.now() >= tokenExpiry) {
    await authenticateAmadeus();
  }
};

// Search flights using Amadeus Flight Offers Search API
export const searchAmadeusFlights = async (searchParams) => {
  try {
    await ensureValidToken();

    //logger.info(' Searching flights with Amadeus API:', searchParams);

    const params = {
      originLocationCode: searchParams.origin || 'BLR',
      destinationLocationCode: searchParams.destination || 'DEL',
      departureDate: searchParams.departureDate || '2025-09-17',
      adults: searchParams.adults || 1,
      children: searchParams.children || 0,
      infants: searchParams.infants || 0,
      travelClass: searchParams.class || 'ECONOMY',
      currencyCode: searchParams.currencyCode || 'INR',
      max: 1
    };

    // Add return date if provided
    if (searchParams.returnDate) {
      params.returnDate = searchParams.returnDate;
    }

    const response = await axios.get(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers`, {
      params,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    logger.info(' Flight search response:', typeof(response.data.data),response.data.data);



    return {
      success: true,
      data: response.data.data

    };

  } catch (error) {
    console.error(' Flight search error:', error.response);
    return {
      success: false,
      error: error.response?.message || error.message
    };
  }
};


// Get flight offer prices
export const getFlightOfferPrices = async (flightDetails) => {
  try {
    await ensureValidToken();
   
   

    const response = await axios.post(`${AMADEUS_BASE_URL}/v1/shopping/flight-offers/pricing`, 
    {
      data: {
      type: "flight-offers-pricing",
      flightOffers: [flightDetails]
      }
    },     
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    }
  );

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    logger.info(' Error fetching flight offer prices:',error.response?.message|| error.message);
    return {
      success: false,
      error: error.message
    };
  }
};


//Create Flight Order

export const createFlightOrder = async (flightDetails,passenger) => {
  try {
    await ensureValidToken();
    if(!passenger || passenger.length === 0){
      return 'Passenger details are required to create flight order';
    }
    const formattedPassengers = []
    passenger.forEach((p) => {
      formattedPassengers.push(passengerDetails(p));
    });
    logger.info(typeof(formattedPassengers),JSON.stringify(formattedPassengers,null,2))
    logger.info('Creating flight order with details:', JSON.stringify(flightDetails, null, 2));

    

    const response = await axios.post(`${AMADEUS_BASE_URL}/v1/booking/flight-orders`, 
    {
      data: {

        type: "flight-order",
        flightOffers: [flightDetails],
        travelers:formattedPassengers,
               
      }
    },     
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    logger.info(' Error creating flight order:', error.response.data);
    return {
      success: false,
      error: error.response.data
    };
  }
}

export const getFlightDetailsByOfferId = async (offerId)=>{
  try{
    await ensureValidToken();
    const flightDetails = await axios.get(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers/`,
      {
        params: {
          id:offerId
        }
      },
    
      {
        headers:{
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      },
      
    )
    return{
      sucess:true,
      data:flightDetails.data.data
    }

  }catch(err){

    return err.response?.data

  }
} 






