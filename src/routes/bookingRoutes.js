import express from 'express';
import {createBookingControllerFromAmadeus} from '../controllers/bookingController.js';
import authenticateToken from '../middleware/authentication.js';

const router = express.Router();


router.post('/create-order',createBookingControllerFromAmadeus);



export default router;