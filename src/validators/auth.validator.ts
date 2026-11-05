import * as z from 'zod';

const identifier = z
  .string()
  .trim()
  .min(1, 'Email atau nama pengguna wajib diisi')
  .max(255, 'Email atau nama pengguna maksimal 255 karakter');

const password = z
  .string()
  .min(1, 'Kata sandi wajib diisi')
  .max(255, 'Kata sandi maksimal 255 karakter');

export const loginSchema = z.object({
  body: z.object({
    identifier,
    password,
  }),
});

export type LoginInput = z.input<typeof loginSchema>;
