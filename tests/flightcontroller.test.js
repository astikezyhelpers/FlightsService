import request from 'supertest';
import app from '../src/app.js'
import jwt from "jsonwebtoken";

let token;
let flights;

token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '24h' });

describe('Fligt Services for fetching flight offers',()=>{
    it('should fetch the flight offers',async ()=>{
        const response=await request(app).post(`/api/flights/search/`).set('Authorization', `Bearer ${token}`).send({
            "origin": "BLR",
            "destination": "DEL",
            "departureDate": "2025-09-20",
            "adults":1,
            "class":"ECONOMY",
            "currencyCode":"INR"

        });
        console.log("response",response);
        expect(response.statusCode).toBe(200);
        expect(response.body.data.length>0).toBeTruthy();
        flights=response.body.flightOffers.data[0];
        console.log("flights",flights);
        expect(flights.id).toBeDefined();


    },50000)
    it('It should get flight prices and details by flight offer id', async () => {
        const response = await request(app)
        .post('/api/flights/flight-price')
        .set('Authorization', `Bearer ${token}`)
        .send(flights);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data");
    },40000
    )
    it('It shoud return PNR number and queing id', async () => {
        const response = await request(app)
        .post('/api/bookings/create-order')
        .set('Authorization', `Bearer ${token}`)
        .send(
            {
                flightDetails:flights,
                passenger:[
                    {
                        "id": "1",
                        "dateOfBirth": "2003-06-04",
                        "firstName": "Sasikiran",
                        "lastName": "Dommara",
                        "gender": "MALE",
                        "emailAddress": "sasikiran@gmail.com",
                        "deviceType": "MOBILE",
                        "countryCallingCode": "91",
                        "number": "8074578965",
                        "documentType": "PASSPORT",
                        "birthPlace": "Hyderabad",
                        "issuanceLocation": "Hyderabad",
                        "issuanceDate": "2015-04-14",
                        "psNumber":"P1234567",
                        "expiryDate": "2029-04-14",
                        "issuanceCountry": "IN",
                        "validityCountry": "IN",
                        "nationality": "IN",
                        "addressLine":"123 Street Gachhibowli",
                        "postalCode":"453123",
                        "cityName":"Hyderabad",
                        "countryCode":"IN"
                    }
                ]
            });
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("data");
            expect(response.body.success).toBeTruthy();
           
        }
        
    ,40000
    );
});

