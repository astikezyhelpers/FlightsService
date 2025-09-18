import dotenv from 'dotenv';
import app from './app.js'
import logger from '../logger.js'
dotenv.config({path:'./.env'});

const PORT = process.env.PORT || 3004;
app.listen(PORT,()=>{
    logger.info(`Server is running on port ${PORT}`);
}) 