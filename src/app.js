import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/db.js";
import router from "./routes/flightRouter.js";
import bookingRoutes from './routes/bookingRoutes.js';



import cors from "cors";

const app = express();
const PORT = 3004;
connectDB();
app.use(express.json());

app.use(express.urlencoded({extended:true}));
app.use(cors())
app.use('/api/flights',router)
app.use('/api/flights', bookingRoutes);
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
}) 

