import Joi from "joi";

export const flightSearchSchema = Joi.object({
  origin: Joi.string()
    .length(3) 
    .uppercase()
    .required()
    .messages({
      "string.empty": "Origin airport code is required",
      "string.length": "Origin must be a valid 3-letter IATA code"
    }),

  destination: Joi.string()
    .length(3)
    .uppercase()
    .required()
    .messages({
      "string.empty": "Destination airport code is required",
      "string.length": "Destination must be a valid 3-letter IATA code"
    }),

  departureDate: Joi.date()
    .iso()
    .min("now")
    .required()
    .messages({
      "date.base": "Departure date must be a valid date",
      "date.greater": "Departure date must be in the future",
      "any.required": "Departure date is required"
    }),

  adults: Joi.number()
    .integer()
    .min(1)
    .max(9)
    .default(1)
    .messages({
      "number.base": "Adults must be a number",
      "number.min": "At least 1 adult is required",
      "number.max": "Maximum 9 adults are allowed"
    }),

  children: Joi.number()
    .integer()
    .min(0)
    .max(9)
    .default(0)
    .messages({
      "number.base": "Children must be a number",
      "number.min": "Children cannot be less than 0",
      "number.max": "Maximum 9 children are allowed"
    }),

  infants: Joi.number()
    .integer()
    .min(0)
    .max(5)
    .default(0)
    .messages({
      "number.base": "Infants must be a number",
      "number.min": "Infants cannot be less than 0",
      "number.max": "Maximum 5 infants are allowed"
    }),

  class: Joi.string()
    .valid("ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST")
    .default("ECONOMY")
    .messages({
      "any.only": "Class must be one of ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST"
    }),

  currencyCode: Joi.string()
    .length(3)
    .uppercase()
    .default("INR")
    .messages({
      "string.length": "Currency must be a 3-letter ISO currency code"
    })
});
