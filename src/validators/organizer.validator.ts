import * as z from 'zod';
import { cities } from '../constants/cities';
import { provinces } from '../constants/provinces';
import { banks } from '../constants/banks';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

const email = z
  .string()
  .trim()
  .pipe(
    z
      .email('Format email tidak valid')
      .max(255, 'Email maksimal 255 karakter'),
  );

const username = z
  .string()
  .trim()
  .min(1, 'Nama pengguna wajib diisi')
  .max(50, 'Nama pengguna maksimal 50 karakter');

const password = z
  .string()
  .min(1, 'Kata sandi wajib diisi')
  .max(255, 'Kata sandi maksimal 255 karakter');

const organizerName = z
  .string()
  .min(1, 'Nama Event Organizer wajib diisi')
  .max(150, 'Maksimal 150 karakter');

const organizerType = z.enum(
  ['INDIVIDUAL', 'COMPANY'],
  'Pilih jenis Event Organizer',
);

const legalName = z
  .string()
  .trim()
  .min(1, 'Nama legal wajib diisi')
  .max(200, 'Maksimal 200 karakter');

const organizerBio = z.preprocess(
  emptyToUndefined,
  z.string().max(2500, 'Maksimal 2500 karakter').optional(),
);

const websiteUrl = z.preprocess(
  emptyToUndefined,
  z.string().max(255, 'Maksimal 255 karakter').optional(),
);

const instagramUrl = z.preprocess(
  emptyToUndefined,
  z.string().max(255, 'Maksimal 255 karakter').optional(),
);

const npwp = z
  .string()
  .trim()
  .regex(/^\+?[0-9]+$/, 'NPWP hanya boleh berisi angka')
  .min(15, 'NPWP minimal 15 digit')
  .max(16, 'NPWP maksimal 16 digit');

const nib = z.preprocess(
  emptyToUndefined,
  z.string().max(13, 'NIB maksimal 13 karakter').optional(),
);

const picName = z
  .string()
  .min(1, 'Nama penanggung jawab wajib diisi')
  .max(100, 'Maksimal 100 karakter');

const picNik = z
  .string()
  .trim()
  .regex(/^[0-9]{16}$/, 'NIK harus 16 digit angka');

const picPhoneNumber = z
  .string()
  .trim()
  .max(20, 'No. ponsel maksimal 20 karakter')
  .regex(/^\+?[0-9]+$/, 'No. ponsel hanya boleh berisi angka');

const officeAddress = z
  .string()
  .min(1, 'Alamat kantor wajib diisi')
  .max(500, 'Maksimal 500 karakter');

const city = z.enum(cities, 'Pilih salah satu kota');

const province = z.enum(provinces, 'Pilih salah satu provinsi');

const postalCode = z
  .string()
  .trim()
  .regex(/^[0-9]{5}$/, 'Kode pos harus 5 digit angka');

const bankName = z.enum(banks, 'Pilih salah satu bank');

const bankAccountNumber = z
  .string()
  .trim()
  .min(1, 'Nomor rekening wajib diisi')
  .max(30, 'Maksimal 30 karakter');

const bankAccountHolder = z
  .string()
  .trim()
  .min(1, 'Nama pemilik rekening wajib diisi')
  .max(200, 'Maksimal 200 karakter');

export const organizerRegisterSchema = z.object({
  body: z.object({
    email,
    username,
    password,
    organizerName,
    organizerType,
    legalName,
    organizerBio,
    websiteUrl,
    instagramUrl,
    npwp,
    nib,
    picName,
    picNik,
    picPhoneNumber,
    officeAddress,
    city,
    province,
    postalCode,
    bankName,
    bankAccountNumber,
    bankAccountHolder,
  }),
});

export type OrganizerRegisterInput = z.input<typeof organizerRegisterSchema>;
export type OrganizerRegisterOutput = z.output<typeof organizerRegisterSchema>;
