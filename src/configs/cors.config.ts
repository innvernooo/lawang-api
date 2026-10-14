import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',');

    if (ALLOWED_ORIGINS!.includes(origin!))
      return callback(new Error('Origin not allowed by CORS'), false);

    return callback(null, true);
  },
};