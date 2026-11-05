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

    if (!token) throw new AppError(401, 'Kamu harus masuk terlebih dahulu');

    const payload = await Jwt.verify(token, process.env.JWT_SECRET_KEY!);

    res.locals.payload = payload;

    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(new AppError(401, 'Sesi kamu sudah berakhir, silakan masuk lagi'));
  }
};

export const authorize = (allowedRole: string[]) => {
  return (_: Request, res: Response, next: NextFunction) => {
    if (!allowedRole.includes(res?.locals?.payload?.role))
      return next(new AppError(403, 'Maaf, akunmu tidak punya akses ke halaman ini'));

    next();
  };
};
