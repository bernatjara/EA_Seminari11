import dotenv from 'dotenv';

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
/* const MONGO_URL = `mongodb://mongoXKM0:27017/proyecto`;  /* Local              /*`mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.0l32gpp.mongodb.net/`;*/
const MONGO_URL = `mongodb://127.0.0.1:27017/proyecto`; /* Production */


const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 9090;

export const config = {
    mongo: {
        username: MONGO_USERNAME,
        password: MONGO_PASSWORD,
        url: MONGO_URL
    },
    server: {
        port: SERVER_PORT
    } 
};
