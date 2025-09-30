import dotenv from 'dotenv';
dotenv.config({path:'./.env'})
import express from "express";
import connectDB from "./config/db.js";
import router from "./routes/flightRouter.js";
import bookingRoutes from './routes/bookingRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import AppError from './utils/appError.js';
import cors from "cors";
import client from 'prom-client';
import responseTime from 'response-time';

const app = express();

const PORT = process.env.PORT || 3004;
//connectDB();
app.use(express.json());

app.use(express.urlencoded({extended:true}));
app.use(cors())

const register = client.register;

client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
    name: 'http_request_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],

})

const httpRequestDuration = new client.Histogram({
    name: 'http_request_response_time_seconds',
    help: 'Histogram of response time for HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 1.5, 2, 5] // Define your own buckets

});

app.use(responseTime((req, res, time) => {
    let routePath = req.route?.path || req.path;
    routePath = routePath.replace(/\d+/g,':id'); // Replace numbers with :id to generalize the route

    httpRequestCounter.labels(req.method, routePath, res.statusCode).inc();
    httpRequestDuration.labels(req.method, routePath, res.statusCode).observe(time / 1000); // convert to seconds
}));

app.use('/api/flights', router)           // Flight routes: /api/flights/search, /api/flights/:id/offer
app.use('/api/bookings', bookingRoutes);  // Booking routes: /api/bookings/book, /api/bookings/:id
app.get('/metrics', async (req, res) => {
    try{
        res.set('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.send(metrics);
    }catch(err){
        res.status(500).send(err.message);   
    }
});



app.use(errorHandler);


export default app;

