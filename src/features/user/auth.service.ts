import 'dotenv/config';
import { randomBytes } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../../configs/prisma-client.config';
import { AppError } from '../../errors/app.error';
import {
  LoginUserInput,
  NewUserOutput,
  PatchUserInput,
} from '../../validators/auth.validator';
import { Bcrypt } from '../../lib/bcrypt.lib';
import { Jwt } from '../../lib/jwt.lib';

const generateReferralCode = () => randomBytes(6).toString('hex').toUpperCase();

export class UserService {
  static async create({ body }: NewUserOutput, file: Express.Multer.File[]) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
      select: { id: true },
    });
    if (existing) throw new AppError(409, 'Email or username already used');

    const hashPassword = Bcrypt.hashPassword(body?.password, 10);

    const referrer = body.referralCode
      ? await prisma.user.findUnique({
          where: { referralCode: body.referralCode },
          select: { id: true },
        })
      : null;
    if (body.referralCode && !referrer)
      throw new AppError(400, 'Referral code not found');

    const profilePictureUrl = file[0]
      ? `/uploads/${file[0].filename}`
      : undefined;

    return prisma.user.create({
      data: {
        ...body,
        password: await hashPassword,
        profilePictureUrl,
        referralCode: generateReferralCode(),
        referredById: referrer?.id,
      },
      omit: { password: true },
    });
  }

  static async login({ body }: LoginUserInput) {
    const user = await prisma.user.findFirst({
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
    { body }: PatchUserInput,
    file: Express.Multer.File[],
    userId: string,
  ) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true, profilePictureUrl: true },
    });

    if (!user) throw new AppError(404, 'User not found');

    if (body.username) {
      const duplicate = await prisma.user.findFirst({
        where: { username: body.username, id: { not: userId } },
        select: { id: true },
      });
      if (duplicate) throw new AppError(409, 'Username already used');
    }

    const profilePictureUrl = file[0]
      ? `/uploads/${file[0].filename}`
      : undefined;

    const updated = await prisma.user.update({
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
