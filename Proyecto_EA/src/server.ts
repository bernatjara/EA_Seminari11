import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import userRoutes from './routes/User';
import cors from 'cors';
import { Server } from 'socket.io';

const router = express();

mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority', serverSelectionTimeoutMS:5000 })
    .then(() => {
        //console.log('connected');  // Se puede hacer sin la libreria para el Logging, es solo más estético
        Logging.info('connected to mongoDB');
        StartServer(); // Función para inciar el server solo si se conecta mongoose
    })
    .catch((error) => {
        //console.error(error);
        Logging.error('Unable to connect: ');
        Logging.error(error);
    });

/** Only Start Server if Mongoose Connects */
const StartServer = () => {
    /** Log the request */
    router.use((req, res, next) => {
        /** Log the req */
        Logging.info(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            /** Log the res */
            Logging.info(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
        });

        next();
    });

    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());
    router.use(cors());

    /** Routes */
    router.use('/users', userRoutes);

    /** Healthcheck */
    router.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong' }));

    /** Error handling */
    router.use((req, res, next) => {
        const error = new Error('Not found');
        Logging.error(error);

        res.status(404).json({
            message: error.message
        });
    });
    // http.createServer(router).listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}`));
    const server = http.createServer(router);
    const io = new Server(server);

    io.on('connection', (socket) => {
        Logging.info('A user connected');

        socket.on('chat message', (msg) => {
            Logging.info(`Message: ${msg}`);
            io.emit('chat message', msg);
        });

        socket.on('disconnect', () => {
            Logging.info('User disconnected');
        });
    });

    server.listen(config.server.port, () => {
        Logging.info(`Server is running on port ${config.server.port}`);
    });

};
