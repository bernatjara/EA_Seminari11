import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const SIGNATURE = process.env.SIGNATURE || '';


interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers["x-access-token"] as string | undefined;
  if (!token) {
    return res.status(401).json({
      auth: false,
      message: "No se ha aportado ningún Token",
    });
  }
  try {
    const decoded: any = jwt.verify(token, SIGNATURE);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      auth: false,
      message: "Token inválido",
    });
  }
}

export default verifyToken;