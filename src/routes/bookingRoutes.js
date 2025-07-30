import express from 'express';
import { createBooking, getBookingById } from '../controllers/bookingController.js';

const router = express.Router();

// POST /api/flights/book
router.post('/book', createBooking);

// GET /api/flights/bookings/:id
router.get('/bookings/:id', getBookingById);

export default router;