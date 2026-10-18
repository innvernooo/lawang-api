import 'dotenv/config';
import { randomBytes } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../../configs/prisma-client.config';
import { AppError } from '../../errors/app.error';
import {
  LoginCustomerInput,
  NewCustomerOutput,
  PatchCustomerInput,
} from '../../validators/customer.validator';
import { Bcrypt } from '../../lib/bcrypt.lib';
import { Jwt } from '../../lib/jwt.lib';

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

    const profilePictureUrl = file[0]
      ? `/uploads/${file[0].filename}`
      : undefined;

    return prisma.$transaction(async (tx) => {
      const user = await tx.customer.create({
        data: {
          ...body,
          password: await hashPassword,
          profilePictureUrl,
          referralCode: generateReferralCode(),
          referredById: referrer?.id,
        },
        omit: { password: true, nik: true },
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

  static async login({ body }: LoginCustomerInput) {
    const user = await prisma.customer.findFirst({
      where: {
        deletedAt: null,
        OR: [{ email: body?.identifier }, { username: body?.identifier }],
      },
    });

    if (!user) throw new AppError(401, 'Invalid email/username or password');

    const comparredPassword = await Bcrypt.comparredPassword(
      body?.password,
      user?.password,
    );

    if (!comparredPassword)
      throw new AppError(401, 'Invalid email/username or password');

    const token = await Jwt.generate(
      {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
      },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: '2h' },
    );

    const { password, ...safeUser } = user;
    return {
      token,
      safeUser,
    };
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
}
