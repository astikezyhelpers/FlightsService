import dotenv from 'dotenv';
import mongoose from "mongoose";
import logger from '../../logger.js';

dotenv.config({path:'../../.env'})


const connectDB = async () => {
    try {
        logger.info('Connecting to MongoDB...',process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        logger.info("MongoDB connected")
    } catch (error) {
        logger.error(error.message);
    }
}


export default connectDB;