import dotenv from 'dotenv';
import mongoose from "mongoose";
dotenv.config({path:'../../.env'})


const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...',process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected")
    } catch (error) {
        console.log(error.message);
    }
}


export default connectDB;