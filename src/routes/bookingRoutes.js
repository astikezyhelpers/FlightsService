import express from 'express';
import {createBookingControllerFromAmadeus} from '../controllers/bookingController.js';

const router = express.Router();


router.post('/create-order', createBookingControllerFromAmadeus);



export default router;