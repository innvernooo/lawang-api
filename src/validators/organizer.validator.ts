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
      .email('Invalid email format')
      .max(255, 'Email input has maximum 255 characters'),
  );

const username = z
  .string()
  .trim()
  .min(1, 'Username input is required')
  .max(50, 'Username input has maximum 50 characters');

const password = z
  .string()
  .min(1, 'Password input is required')
  .max(255, 'Maximum input has maximum 255 characters');

const organizerName = z
  .string()
  .min(1, 'Organizer name input is required')
  .max(150, 'Maximum input has maximum 150 characters');

const organizerType = z.enum(
  ['INDIVIDUAL', 'COMPANY'],
  'Oragnaizer type must be choosen',
);

const legalName = z
  .string()
  .trim()
  .min(1, 'Legal Name input is required')
  .max(200, 'Maximum input is 200 characters');

const organizerBio = z.preprocess(
  emptyToUndefined,
  z.string().max(2500, 'Maximum input is 2500 characters').optional(),
);

const websiteUrl = z.preprocess(
  emptyToUndefined,
  z.string().max(255, 'Maximum input is 255 characters').optional(),
);

const instagramUrl = z.preprocess(
  emptyToUndefined,
  z.string().max(255, 'Maximum input is 255 characters').optional(),
);

const npwp = z
  .string()
  .trim()
  .regex(/^\+?[0-9]+$/, 'NPWP input must contain digits only')
  .min(15, 'Minimum length is 15 characters')
  .max(16, 'Maximum length is 16 characters');

const nib = z.preprocess(
  emptyToUndefined,
  z.string().max(13, 'Maximum input is 13 characters').optional(),
);

const picName = z
  .string()
  .min(1, 'PIC Name input is required')
  .max(100, 'Maximum input is 100 characters');

const picNik = z
  .string()
  .trim()
  .regex(/^[0-9]{16}$/, 'NIK must be 16 digits');

const picPhoneNumber = z
  .string()
  .trim()
  .max(20, 'Phone number input is 20 characters')
  .regex(/^\+?[0-9]+$/, 'Phone number must contain digits only');

const officeAddress = z
  .string()
  .min(1, 'Office address input is required')
  .max(500, 'Maximum input is 500 characters');

const city = z.enum(cities, 'Pick one of the cities');

const province = z.enum(provinces, 'Pick one of the provinces');

const postalCode = z
  .string()
  .trim()
  .regex(/^[0-9]{5}$/, 'Postal code must be 5 digits');

const bankName = z.enum(banks, 'Pick one of the banks');

const bankAccountNumber = z
  .string()
  .trim()
  .min(1, 'Bank account number input is required')
  .max(30, 'Maximum input is 30 characters');

const bankAccountHolder = z
  .string()
  .trim()
  .min(1, 'Bank account holder input is required')
  .max(200, 'Maximum input is 200 characters');

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
