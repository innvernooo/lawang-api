import { prisma } from '../../configs/prisma-client.config';
import { AppError } from '../../errors/app.error';
import {
  ConfirmationOutput,
  GetTransactionOutput,
} from '../../validators/confirm.validator';
import { restoreResources } from './confirm.helper';
import transporter from '../../lib/transporter.lib';
import Handlebars from 'handlebars';
import { paymentSuccessTemplate } from '../../templates/payment-succesfull';
import { paymentRejectedTemplate } from '../../templates/payment-rejected';

export class ConfirmationService {
  static async accept({ params }: ConfirmationOutput, organizerId: string) {
    const now = new Date();

    const checkTransactionId = await prisma.transaction.findFirst({
      where: {
        id: params.transactionId,
        event: { organizerId },
      },
    });

    if (!checkTransactionId)
      throw new AppError(404, 'Transaksi tidak ditemukan');
    if (checkTransactionId.status !== 'WAITING_CONFIRMATION')
      throw new AppError(409, 'Transaksi ini tidak sedang menunggu konfirmasi');
    if (
      checkTransactionId.confirmDeadlineAt &&
      checkTransactionId.confirmDeadlineAt <= now
    )
      throw new AppError(400, 'Batas waktu konfirmasi sudah lewat');

    return prisma.$transaction(
      async (tx) => {
        const [accepted] = await tx.transaction.updateManyAndReturn({
          where: {
            id: params.transactionId,
            event: { organizerId },
            status: 'WAITING_CONFIRMATION',
            OR: [
              { confirmDeadlineAt: null },
              { confirmDeadlineAt: { gt: now } },
            ],
          },
          data: {
            status: 'DONE',
            decidedAt: now,
          },
          include: {
            customer: {
              select: {
                email: true,
                name: true,
              },
            },
            event: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!accepted)
          throw new AppError(
            409,
            'Transaksi ini sudah tidak bisa dikonfirmasi',
          );

        const templateHTMLCompiled = Handlebars.compile(paymentSuccessTemplate);

        const html = templateHTMLCompiled({
          customerName: accepted?.customer?.name ?? 'Customer',
          transactionId: accepted?.id ?? '',
          eventName: accepted?.event?.name,
          paymentDate: now.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Jakarta',
          }),
          amount: (accepted?.totalPrice ?? 0).toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }),
          profileUrl: `${process.env.FRONTEND_URL}/transaction/me`,
        });

        await transporter.sendMail({
          to: accepted?.customer?.email,
          subject: 'Pembayaran Diterima! Terima kasih sudah memesan di Lawang',
          html: html,
        });

        return accepted;
      },
      { timeout: 15000 },
    );
  }

  static async reject({ params }: ConfirmationOutput, organizerId: string) {
    const now = new Date();

    const checkTransactionId = await prisma.transaction.findFirst({
      where: {
        id: params.transactionId,
        event: { organizerId },
      },
    });

    if (!checkTransactionId)
      throw new AppError(404, 'Transaksi tidak ditemukan');
    if (checkTransactionId.status !== 'WAITING_CONFIRMATION')
      throw new AppError(409, 'Transaksi ini tidak sedang menunggu konfirmasi');
    if (
      checkTransactionId.confirmDeadlineAt &&
      checkTransactionId.confirmDeadlineAt <= now
    )
      throw new AppError(400, 'Batas waktu konfirmasi sudah lewat');

    return prisma.$transaction(
      async (tx) => {
        const [rejected] = await tx.transaction.updateManyAndReturn({
          where: {
            id: params.transactionId,
            status: 'WAITING_CONFIRMATION',
            event: { organizerId },
          },
          data: {
            status: 'REJECTED',
            decidedAt: now,
          },
          include: {
            customer: {
              select: {
                email: true,
                name: true,
              },
            },
            event: {
              select: {
                name: true,
              },
            },
            ticketType: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!rejected)
          throw new AppError(409, 'Transaksi ini sudah tidak bisa ditolak');

        await restoreResources(tx, rejected, now);

        const templateHTMLCompiled = Handlebars.compile(
          paymentRejectedTemplate,
        );

        const html = templateHTMLCompiled({
          customerName: rejected?.customer?.name ?? 'Customer',
          transactionId: rejected?.id ?? '',
          eventName: rejected?.event?.name,
          ticketName: rejected?.ticketType?.name,
          quantity: rejected?.quantity,
          rejectedDate: now.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Jakarta',
          }),
          amount: (rejected?.totalPrice ?? 0).toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }),
          transactionUrl: `${process.env.FRONTEND_URL}/transaction/me`,
        });

        await transporter.sendMail({
          to: rejected?.customer?.email,
          subject: 'Maaf, pembayaranmu ditolak',
          html: html,
        });

        return rejected;
      },
      { timeout: 15000 },
    );
  }

  static async cancel({ params }: ConfirmationOutput, customerId: string) {
    const now = new Date();

    const checkTransactionId = await prisma.transaction.findFirst({
      where: {
        id: params.transactionId,
        customerId,
      },
    });

    if (!checkTransactionId)
      throw new AppError(404, 'Transaksi tidak ditemukan');
    if (checkTransactionId.status !== 'WAITING_PAYMENT')
      throw new AppError(409, 'Transaksi ini tidak sedang menunggu pembayaran');
    if (
      checkTransactionId.paymentExpiresAt &&
      checkTransactionId.paymentExpiresAt <= now
    )
      throw new AppError(400, 'Transaksi sudah kedaluwarsa');

    return await prisma.$transaction(async (tx) => {
      const [canceled] = await tx.transaction.updateManyAndReturn({
        where: {
          id: params.transactionId,
          status: 'WAITING_PAYMENT',
          customerId,
        },
        data: {
          status: 'CANCELED',
          decidedAt: now,
        },
      });

      if (!canceled)
        throw new AppError(409, 'Transaksi ini sudah tidak bisa dibatalkan');

      await restoreResources(tx, canceled, now);

      return canceled;
    });
  }

  static async getTransaction(
    { params, query }: GetTransactionOutput,
    organizerId: string,
  ) {
    const checkEventId = await prisma.event.findUnique({
      where: {
        id: params.eventId,
        organizerId,
      },
    });

    if (!checkEventId)
      throw new AppError(404, 'Event tidak ditemukan atau bukan milikmu');

    return await prisma.transaction.findMany({
      where: {
        eventId: params.eventId,
        status: 'WAITING_CONFIRMATION',
      },
      orderBy: {
        confirmDeadlineAt: 'asc',
      },
      include: {
        customer: {
          select: {
            email: true,
          },
        },
        ticketType: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
