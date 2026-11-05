import 'dotenv/config';
import { prisma } from '../../configs/prisma-client.config';
import { AppError } from '../../errors/app.error';
import { Bcrypt } from '../../lib/bcrypt.lib';
import { OrganizerRegisterOutput } from '../../validators/organizer.validator';
import { cloudionaryUpload } from '../../lib/cloudinary.lib';

export class OrganizerService {
  static async register(
    { body }: OrganizerRegisterOutput,
    file: Express.Multer.File[],
  ) {
    const existing = await prisma.organizer.findFirst({
      where: {
        OR: [
          { email: body?.email },
          { username: body?.username },
          { npwp: body?.npwp },
          ...(body?.nib ? [{ nib: body?.nib }] : []),
        ],
      },
      select: {
        id: true,
      },
    });

    if (existing)
      throw new AppError(409, 'Email, nama pengguna, atau NPWP sudah terdaftar');

    const usedByCustomer = await prisma.customer.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
      select: { id: true },
    });
    if (usedByCustomer)
      throw new AppError(409, 'Email, nama pengguna, atau NPWP sudah terdaftar');

    const hashPassword = Bcrypt.hashPassword(body?.password, 10);

    const cloudinaryUploadUrl = file[0]
      ? ((await cloudionaryUpload(
          file[0]?.buffer,
          'OrganizerPicture',
        )) as string)
      : undefined;

    return prisma.organizer.create({
      data: {
        ...body,
        password: await hashPassword,
        profilePictureUrl: cloudinaryUploadUrl,
      },
      omit: {
        password: true,
        picNik: true,
        deletedAt: true,
      },
    });
  }

  static async profile(organizerId: string) {
    return await prisma.organizer.findUnique({
      where: {
        id: organizerId,
      },
    });
  }
}
