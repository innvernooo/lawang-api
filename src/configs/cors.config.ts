import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    const ALLOWED_ORIGINS =
      process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) ?? [];

    if (!origin || ALLOWED_ORIGINS.includes(origin))
      return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
};
