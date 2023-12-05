import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import {mongoosePagination, PaginationOptions } from 'mongoose-paginate-ts';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const SIGNATURE = process.env.SIGNATURE || '';

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { username, fullname, email, password, rol } = req.body;

    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        username,
        fullname,
        email,
        password,
        rol
    });

    user.password = await user.encryptPassword(user.password);
    return user
        .save()
        .then((user) => res.status(201).json( user ))
        .catch((error) => res.status(500).json({ error }));
};

const readUser = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    return User.findById(userId)
        .then((user) => (user ? res.status(200).json( user ) : res.status(404).json({ message: 'not found' })))
        .catch((error) => res.status(500).json({ error }));
};

const readAll = (req: Request, res: Response, next: NextFunction) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1; 
    const options: PaginationOptions = {
        page,
        limit: 3
    };
    return User.paginate(options)
        .then((result) => res.status(200).json(result))
        .catch((error) => res.status(500).json({ error }));
};

const updateUser = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    return User.findById(userId)
        .then((user) => {
            if (user) {
                user.set(req.body);

                return user
                    .save()
                    .then((user) => res.status(201).json({ user }))
                    .catch((error) => res.status(500).json({ error }));
            } else {
                return res.status(404).json({ message: 'not found' });
            }
        })
        .catch((error) => res.status(500).json({ error }));
};

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    return User.findByIdAndDelete(userId)
        .then((user) => (user ? res.status(201).json( user ) : res.status(404).json({ message: 'not found' })))
        .catch((error) => res.status(500).json({ error }));
};

const signin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).send("El email no existe");
    }
    const validPassword = await user.validatePassword(password);
    if (!validPassword) {
      return res.status(401).json({ auth: false, token: null });
    }
    const token = jwt.sign({ id: user._id, rol: user.rol}, SIGNATURE, {
      expiresIn: 60 * 60 * 24,
    });
    return res.json({ auth: true, token });
}

const usernameExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.params;
        const existingUser = await User.findOne({ username });
        const usernameExists = existingUser !== null;

        res.status(200).json({ usernameExists });
    } catch (error) {
        res.status(500).json({ error });
    }
};

const emailExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.params;
        const existingUser = await User.findOne({ email });
        const emailExists = existingUser !== null;

        res.status(200).json({ emailExists });
    } catch (error) {
        res.status(500).json({ error });
    }
};

export default { createUser, readUser, readAll, updateUser, deleteUser, signin, usernameExists, emailExists };
