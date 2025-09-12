import dotenv from 'dotenv';
dotenv.config({path:'./.env'})
import express from "express";
import connectDB from "./config/db.js";
import router from "./routes/flightRouter.js";
import bookingRoutes from './routes/bookingRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import AppError from './utils/appError.js';
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3004;
connectDB();
app.use(express.json());

app.use(express.urlencoded({extended:true}));
app.use(cors())



// Mount routes at different paths to avoid conflicts
app.use('/api/flights', router)           // Flight routes: /api/flights/search, /api/flights/:id/offer
app.use('/api/bookings', bookingRoutes);  // Booking routes: /api/bookings/book, /api/bookings/:id


app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
}) 

