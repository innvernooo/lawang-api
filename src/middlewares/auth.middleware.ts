import 'dotenv/config';
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app.error';
import { Jwt } from '../lib/jwt.lib';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.token;

    if (!token) throw new AppError(401, 'Token must be provided');

    const payload = await Jwt.verify(token, process.env.JWT_SECRET_KEY!);

    res.locals.payload = payload;

    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(new AppError(401, 'Invalid or expired token'));
  }
};

export const authorize = (allowedRole: string[]) => {
  return (_: Request, res: Response, next: NextFunction) => {
    if (!allowedRole.includes(res?.locals?.payload?.role))
      return next(new AppError(403, 'Forbidden: insufficient role'));

    next();
  };
};
