import * as z from 'zod';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

const name = z
  .string()
  .trim()
  .min(1, 'Nama lengkap wajib diisi')
  .max(100, 'Nama lengkap maksimal 100 karakter');

const username = z
  .string()
  .trim()
  .min(5, 'Nama pengguna wajib diisi, minimal 5 karakter')
  .max(50, 'Nama pengguna maksimal 50 karakter');

const email = z
  .email('Format email tidak valid')
  .trim()
  .max(255, 'Email maksimal 255 karakter');

const password = z
  .string()
  .min(1, 'Kata sandi wajib diisi')
  .max(255, 'Kata sandi maksimal 255 karakter');

const referralCode = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .toUpperCase()
    .length(12, 'Kode referral harus 12 karakter')
    .optional(),
);

const phoneNumber = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .max(20, 'No. ponsel maksimal 20 karakter')
    .regex(/^\+?[0-9]+$/, 'No. ponsel hanya boleh berisi angka')
    .optional(),
);

const nik = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .regex(/^[0-9]{16}$/, 'NIK harus 16 digit angka')
    .optional(),
);

export const registerCustomerSchema = z.object({
  body: z.object({
    name,
    username,
    email,
    password,
    phoneNumber,
    nik,
    referralCode,
  }),
});

export const patchCustomerSchema = z.object({
  body: z.object({
    name: z.preprocess(emptyToUndefined, name.optional()),
    username: z.preprocess(emptyToUndefined, username.optional()),
    phoneNumber,
  }),
});
export type NewCustomerInput = z.input<typeof registerCustomerSchema>;
export type NewCustomerOutput = z.output<typeof registerCustomerSchema>;
export type PatchCustomerInput = z.infer<typeof patchCustomerSchema>;
