import { v4 as uuidv4 } from 'uuid';

// Generate unique booking ID
export const generateBookingId = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK${timestamp}${random}`;
};

// Generate confirmation code
export const generateConfirmationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Calculate booking expiry (24 hours from now)
export const calculateExpiryTime = () => {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
};

export const passengerDetails = (p)=>{
 
  return {
    id:p.id,
    dateOfBirth:p.dateOfBirth,
    name:{
      firstName:p.firstName,
      lastName:p.lastName,
    },
    gender:p.gender,
    contact:{
      emailAddress:p.emailAddress,
      phones:[
        {
          deviceType:p.deviceType,
          countryCallingCode:p.countryCallingCode,
          number:p.number
        }
      ]
    },
    documents:[
      {
        documentType:p.documentType||"PASSPORT",
        birthPlace:p.birthPlace,
        issuanceLocation:p.issuanceLocation,
        issuanceDate:p.issuanceDate,
        number:p.psNumber,
        expiryDate:p.expiryDate,
        issuanceCountry:p.issuanceCountry,
        validityCountry:p.validityCountry,
        nationality:p.nationality,
        holder:p.holder || true 
      }
    ]

  }

  
}

export const transeformedFlight = (flightOffers)=>{
  const transformedOffers = flightOffers.data.map((offer)=>{
    return{
      offerId:offer.id,
      passengerId:offer.travelerPricings[0].travelerId,
      travelerType:offer.travelerPricings[0].travelerType,
      lastTicketingDate:offer.lastTicketingDate,
      lastTicketingDateTime:offer.lastTicketingDateTime,
      instantTicketingRequired:offer.instantTicketingRequired,
      numberOfBookableSeats:offer.numberOfBookableSeats,

      fareDetails:{
        fareOption:offer.travelerPricings[0].fareOption,
        brandedFare:offer.travelerPricings[0].fareDetailsBySegment[0].brandedFare,
        cabin: offer.travelerPricings[0].fareDetailsBySegment[0].cabin,
        brandedFare:offer.travelerPricings[0].fareDetailsBySegment[0].brandedFare,
        brandedFareLabel:offer.travelerPricings[0].fareDetailsBySegment[0].brandedFareLabel,
        class:offer.travelerPricings[0].fareDetailsBySegment[0].class,
      },
      price:{
        currency:offer.price.currency,
        basePrice:offer.price.base,
        taxes:parseFloat(offer.price.total) - parseFloat(offer.price.base),
        total:offer.price.total,
        grandTotal:offer.price.grandTotal
      },
      flightDetails:offer.itineraries[0].segments?.length>0?offer.itineraries[0].segments.map((f)=>{
        return{
          departureAt:f.departure.iataCode,
          terminal:f.departure.terminal,
          departureTime:f.departure.at,
          arrivalAt:f.arrival.iataCode,
          terminalArrival:f.arrival.terminal,
          arrivalTime:f.arrival.at,
          flightNumber:f.number,
          carrierCode:f.carrierCode,
          airCraftCode:f.aircraft.code,
          operatingCarrier:f.operating?.carrierCode || f.carrierCode,
          travelDuration:f.duration,
          numberOfStops:f.numberOfStops
        }
      }):([{
        departureAt:offer.itineraries[0].segments[0].departure.iataCode,
        terminal:offer.itineraries[0].segments[0].departure.terminal,
        departureTime:offer.itineraries[0].segments[0].departure.at,
        arrivalAt:offer.itineraries[0].segments[0].arrival.iataCode,
        terminalArrival:offer.itineraries[0].segments[0].arrival.terminal,
        arrivalTime:offer.itineraries[0].segments[0].arrival.at,
        flightNumber:offer.itineraries[0].segments[0].number,
        carrierCode:offer.itineraries[0].segments[0].carrierCode,
        airCraftCode:offer.itineraries[0].segments[0].aircraft.code,
        operatingCarrier:offer.itineraries[0].segments[0].operating.carrierCode,
        travelDuration:offer.itineraries[0].segments[0].duration,
        numberOfStops:offer.itineraries[0].segments[0].numberOfStops,

      }]),
      checkedBaggage:offer.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags,
      amenities:{
        free:[
          offer.travelerPricings[0].fareDetailsBySegment[0].amenities[0].description,
          offer.travelerPricings[0].fareDetailsBySegment[0].amenities[1].description,
          offer.travelerPricings[0].fareDetailsBySegment[0].amenities[5].description
        ],
        chargable:[
          offer.travelerPricings[0].fareDetailsBySegment[0].amenities[2].description,
          offer.travelerPricings[0].fareDetailsBySegment[0].amenities[3].description,
          offer.travelerPricings[0].fareDetailsBySegment[0].amenities[4].description
        ]
      }



    } 
  })
  return transformedOffers;
}
