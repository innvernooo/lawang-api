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

    if (!user) throw new AppError(401, 'Invalid email/username or password');

    const comparredPassword = await Bcrypt.comparredPassword(
      body?.password,
      user?.password,
    );

    if (!comparredPassword)
      throw new AppError(401, 'Invalid email/username or password');

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

  // ===== FUNGSI ME (baru, mengambil profil user yang sedang login) =====
  static async me(userId: string, role: string) {
    const where = { id: userId, deletedAt: null };

    // Role dari token menentukan tabel mana yang dicari
    if (role === 'ORGANIZER') {
      const organizer = await prisma.organizer.findFirst({ where });
      if (!organizer) throw new AppError(404, 'User not found');
      const { password, deletedAt, ...safeUser } = organizer;
      return safeUser;
    }

    const customer = await prisma.customer.findFirst({ where });
    if (!customer) throw new AppError(404, 'User not found');
    const { password, deletedAt, ...safeUser } = customer;
    return safeUser;
  }
}