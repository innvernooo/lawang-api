import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app.error';
import { MulterError } from 'multer';
import { Prisma } from '../generated/prisma/client';

export const errorMiddleware = (
  error: unknown,
  _: Request,
  res: Response,
  __: NextFunction,
) => {
  console.log(error);
  if (error instanceof AppError)
    return res.status(error?.status).json({
      success: false,
      message: error?.message,
      data: {},
    });

  if (error instanceof MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: `File size exceeds the maximum limit of 5 MB`,
        data: {},
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
      data: {},
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002')
      return res.status(409).json({
        success: false,
        message: 'Data already exists (duplicate unique field)',
        data: {},
      });

    if (error.code === 'P2025')
      return res.status(404).json({
        success: false,
        message: 'Data not found',
        data: {},
      });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    data: {},
  });
};
