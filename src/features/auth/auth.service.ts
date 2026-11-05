import 'dotenv/config';
import { prisma } from '../../configs/prisma-client.config';
import { AppError } from '../../errors/app.error';
import { Bcrypt } from '../../lib/bcrypt.lib';
import { Jwt } from '../../lib/jwt.lib';
import { LoginInput } from '../../validators/auth.validator';

export class AuthService {
  // ===== FUNGSI LOGIN (isi asli rekanmu, tidak diubah) =====
  static async login({ body }: LoginInput) {
    const where = {
      deletedAt: null,
      OR: [{ email: body?.identifier }, { username: body?.identifier }],
    };

    const customer = await prisma.customer.findFirst({
      where,
    });

    const user = customer ?? (await prisma.organizer.findFirst({ where }));

    if (!user) throw new AppError(401, 'Email/nama pengguna atau kata sandi salah');

    const comparredPassword = await Bcrypt.comparredPassword(
      body?.password,
      user?.password,
    );

    if (!comparredPassword)
      throw new AppError(401, 'Email/nama pengguna atau kata sandi salah');

    const name = 'organizerName' in user ? user.organizerName : user.name;

    const token = await Jwt.generate(
      {
        id: user?.id,
        name,
        email: user?.email,
        role: user?.role,
      },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: '2h' },
    );

    if ('organizerName' in user) {
      const { password, picNik, deletedAt, ...safeUser } = user;
      return {
        token,
        safeUser,
      };
    }

    // ← SAYA TEBAK: cabang customer, mengikuti pola organizer di atas
    const { password, deletedAt, ...safeUser } = user;
    return {
      token,
      safeUser,
    };
  }

  static async me(id: string, role: string) {
    const identifyUser =
      role === 'ORGANIZER'
        ? await prisma.organizer.findUnique({
            where: {
              id,
            },
            select: {
              id: true,
              email: true,
              organizerName: true,
              role: true,
            },
          })
        : await prisma.customer.findUnique({
            where: {
              id,
            },
            select: {
              id: true,
              email: true,
              username: true,
              role: true,
            },
          });

    return identifyUser;
  }
}

