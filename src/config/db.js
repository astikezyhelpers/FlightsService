import mongoose from "mongoose";

console.log("mongodb connection url is ",process.env.MONGO_URI);
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected")
    } catch (error) {
        console.log(error.message);
    }
}


export default connectDB;