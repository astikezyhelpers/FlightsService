import express from 'express';
import {
    flightsOfferController,
    flightPriceOfferController,
} from '../controllers/flightController.js'
import authenticateToken from '../middleware/authentication.js';

const router = express.Router();


router.post('/search',flightsOfferController);
router.post('/flight-price',authenticateToken, flightPriceOfferController);


export default router;