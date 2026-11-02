import 'dotenv/config';
import { randomBytes } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../../configs/prisma-client.config';
import { AppError } from '../../errors/app.error';
import {
  NewCustomerOutput,
  PatchCustomerInput,
} from '../../validators/customer.validator';
import { Bcrypt } from '../../lib/bcrypt.lib';
import { cloudionaryUpload } from '../../lib/cloudinary.lib';

const generateReferralCode = () => randomBytes(6).toString('hex').toUpperCase();
const generateCouponCode = () =>
  `REF-${randomBytes(4).toString('hex').toUpperCase()}`;

const referralPoint = 10000;
const couponDiscount = 50000;
const validMonths = 3;

const addMonths = (months: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
};

export class CustomerService {
  static async create(
    { body }: NewCustomerOutput,
    file: Express.Multer.File[],
  ) {
    const existing = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: body.email },
          { username: body.username },
          ...(body?.nik ? [{ nik: body?.nik }] : []),
        ],
      },
      select: { id: true },
    });
    if (existing)
      throw new AppError(409, 'Email or username or NIK already used');

    const usedByOrganizer = await prisma.organizer.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
      select: { id: true },
    });
    if (usedByOrganizer)
      throw new AppError(409, 'Email or username already used');

    const hashPassword = Bcrypt.hashPassword(body?.password, 10);

    const referrer = body.referralCode
      ? await prisma.customer.findFirst({
          where: {
            referralCode: body.referralCode,
            role: 'CUSTOMER',
            deletedAt: null,
          },
          select: { id: true },
        })
      : null;
    if (body.referralCode && !referrer)
      throw new AppError(400, 'Referral code not found');

    const cloudinaryUploadUrl = file[0]
      ? ((await cloudionaryUpload(
          file[0]?.buffer,
          'CustomerPicture',
        )) as string)
      : undefined;

    return prisma.$transaction(async (tx) => {
      const user = await tx.customer.create({
        data: {
          ...body,
          password: await hashPassword,
          profilePictureUrl: cloudinaryUploadUrl,
          referralCode: generateReferralCode(),
          referredById: referrer?.id,
        },
        omit: { password: true, nik: true, deletedAt: true },
      });

      if (referrer) {
        await tx.point.create({
          data: {
            customerId: referrer.id,
            amount: referralPoint,
            expiresAt: addMonths(validMonths),
          },
        });

        await tx.coupon.create({
          data: {
            customerId: user.id,
            code: generateCouponCode(),
            discountAmount: couponDiscount,
            expiresAt: addMonths(validMonths),
          },
        });
      }

      return user;
    });
  }

  static async patch(
    { body }: PatchCustomerInput,
    file: Express.Multer.File[],
    userId: string,
  ) {
    const user = await prisma.customer.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, profilePictureUrl: true },
    });

    if (!user) throw new AppError(404, 'User not found');

    if (body.username) {
      const duplicate = await prisma.customer.findFirst({
        where: { username: body.username, id: { not: userId } },
        select: { id: true },
      });
      if (duplicate) throw new AppError(409, 'Username already used');
    }

    const profilePictureUrl = file[0]
      ? `/uploads/${file[0].filename}`
      : undefined;

    const updated = await prisma.customer.update({
      data: {
        ...body,
        profilePictureUrl,
      },
      where: { id: userId },
      omit: { password: true },
    });

    if (profilePictureUrl && user.profilePictureUrl) {
      await fs
        .unlink(path.join(process.cwd(), 'src', user.profilePictureUrl))
        .catch(() => undefined);
    }

    return updated;
  }

  static async me(customerId: string) {
    return await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
      omit: {
        password: true,
        id: true,
        referredById: true,
      },
    });
  }
}
