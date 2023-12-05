import Joi, { ObjectSchema } from 'joi';
import { NextFunction, Response, Request } from 'express';
import Logging from '../library/Logging';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

export const ValidateSchema = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body);

            next();
        } catch (error) {
            Logging.error(error);
            return res.status(422).json({ error });
        }
    };
};

export const Schemas = {
    user: {
        create: Joi.object<IUser>({
            username: Joi.string().required(),
            fullname: Joi.string().required(),
            email: Joi.string().required(),
            password: Joi.string().required(),
            rol: Joi.string().required()
        }),
        update: Joi.object<IUser>({
            username: Joi.string().required(),
            fullname: Joi.string().required(),
            email: Joi.string().required(),
            password: Joi.string().required()
        })
    },
};
