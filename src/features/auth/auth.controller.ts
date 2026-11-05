import { Request, Response } from 'express';
import { validate } from '../../validators/validate';
import { loginSchema } from '../../validators/auth.validator';
import { AuthService } from './auth.service';

export class AuthController {
  static async login(req: Request, res: Response) {
    const { body } = validate(loginSchema, { body: req.body });

    const { token, safeUser } = await AuthService.login({ body });
    const isProd = process.env.NODE_ENV?.toLowerCase() === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
    };

    res.cookie('token', token, {
      ...cookieOptions,
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Berhasil masuk, selamat datang kembali!',
      data: safeUser,
    });
  }

  static async me(_: Request, res: Response) {
    const { payload } = res.locals;

    const user = await AuthService.me(payload?.id, payload?.role);

    res.status(200).json({
      success: true,
      message: 'Data pengguna berhasil dimuat',
      data: user,
    });
  }

  static async out(_: Request, res: Response) {
    const isProd = process.env.NODE_ENV?.toLowerCase() === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
    };

    res.clearCookie('token', cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Berhasil keluar, sampai jumpa lagi!',
      data: {},
    });
  }
}
