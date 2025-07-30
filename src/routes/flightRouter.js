import express from 'express';
import { searchFlights, getFlightAvailability } from '../controllers/flightController.js';

const router = express.Router();

// GET /api/v1/flights/search
router.get('/search', searchFlights);

// GET /api/v1/flights/:flightId/availability
router.get('/:flightId/availability', getFlightAvailability);

export default router;