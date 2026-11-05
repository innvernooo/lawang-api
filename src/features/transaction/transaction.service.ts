import { prisma } from '../../configs/prisma-client.config';
import { AppError } from '../../errors/app.error';
import { cloudionaryUpload } from '../../lib/cloudinary.lib';
import transporter from '../../lib/transporter.lib';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import {
  CreateTransactionOutput,
  GetDetailTrasanctionOutput,
  PaymentOutput,
  pointStep,
  TransPaginationRequest,
} from '../../validators/transaction.validator';

export class TransactionService {
  static async create(
    { params, body }: CreateTransactionOutput,
    customerId: string,
  ) {
    const now = new Date();
    const checkEventId = await prisma.event.findUnique({
      where: {
        id: params.eventId,
        endDate: { gte: now },
      },
    });

    if (!checkEventId)
      throw new AppError(404, 'Event tidak ditemukan atau sudah berakhir');

    const checkTicketTypeId = await prisma.ticketType.findUnique({
      where: {
        id: body.ticketTypeId,
        eventId: params.eventId,
      },
    });

    if (!checkTicketTypeId)
      throw new AppError(404, 'Jenis tiket tidak tersedia untuk event ini');
    if (checkTicketTypeId.endSale && checkTicketTypeId.endSale < now)
      throw new AppError(400, 'Penjualan tiket ini sudah berakhir');

    const checkCouponCode = body.couponCode
      ? await prisma.coupon.findFirst({
          where: {
            code: body.couponCode,
            expiresAt: { gt: new Date() },
            customerId: customerId,
            usedAt: null,
          },
        })
      : null;

    if (body.couponCode && !checkCouponCode)
      throw new AppError(404, 'Kode kupon tidak valid atau sudah kedaluwarsa');

    const checkVoucherCode = body.voucherCode
      ? await prisma.voucher.findUnique({
          where: {
            eventId_code: { eventId: params.eventId, code: body.voucherCode },
          },
        })
      : null;

    if (body.voucherCode) {
      if (!checkVoucherCode)
        throw new AppError(404, 'Kode voucher tidak berlaku untuk event ini');
      if (checkVoucherCode.startDate > now)
        throw new AppError(400, 'Voucher belum bisa dipakai');
      if (checkVoucherCode.endDate <= now)
        throw new AppError(400, 'Voucher sudah kedaluwarsa');
      if (
        checkVoucherCode.quota !== null &&
        checkVoucherCode.usedCount >= checkVoucherCode.quota
      )
        throw new AppError(400, 'Kuota voucher sudah habis');
    }

    const countSubtotal = checkTicketTypeId.price * body.quantity;

    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`select id from customers where id = ${customerId}::uuid for update`;

      const countBeforePoints = Math.max(
        0,
        countSubtotal -
          (checkVoucherCode?.discountAmount ?? 0) -
          (checkCouponCode?.discountAmount ?? 0),
      );

      if (body.pointsUsed > countBeforePoints)
        throw new AppError(400, 'Poin yang dipakai melebihi total harga');

      const countTotalPrice = countBeforePoints - body.pointsUsed;

      const stock = await tx.ticketType.updateMany({
        where: {
          id: checkTicketTypeId.id,
          available: { gte: body.quantity },
        },
        data: {
          available: { decrement: body.quantity },
        },
      });

      if (stock.count === 0)
        throw new AppError(400, 'Maaf, sisa tiket tidak mencukupi');

      if (checkVoucherCode) {
        const updated = await tx.voucher.updateMany({
          where: {
            id: checkVoucherCode.id,
            ...(checkVoucherCode.quota !== null && {
              usedCount: { lt: checkVoucherCode.quota },
            }),
          },
          data: {
            usedCount: { increment: 1 },
          },
        });

        if (updated.count === 0)
          throw new AppError(400, 'Kuota voucher sudah habis');
      }

      if (checkCouponCode) {
        const updated = await tx.coupon.updateMany({
          data: {
            usedAt: now,
          },
          where: {
            id: checkCouponCode.id,
            customerId,
            usedAt: null,
            expiresAt: { gt: now },
          },
        });

        if (updated.count === 0)
          throw new AppError(400, 'Kupon tidak bisa dipakai');
      }

      const batchesNeeded = body.pointsUsed / pointStep;
      const freeBatches = await tx.point.findMany({
        where: {
          customerId,
          expiresAt: { gt: new Date() },
          usages: { none: { restoredAt: null } },
        },
        orderBy: {
          expiresAt: 'asc',
        },
        take: batchesNeeded,
      });

      if (freeBatches.length < batchesNeeded)
        throw new AppError(400, 'Poin kamu tidak cukup');

      const transaction = await tx.transaction.create({
        data: {
          customerId: customerId,
          eventId: params.eventId,
          ticketTypeId: body.ticketTypeId,
          quantity: body.quantity,
          unitPrice: checkTicketTypeId.price,
          subtotal: countSubtotal,
          voucherId: checkVoucherCode?.id,
          voucherDiscount: checkVoucherCode?.discountAmount ?? 0,
          couponId: checkCouponCode?.id,
          couponDiscount: checkCouponCode?.discountAmount ?? 0,
          pointsUsed: body.pointsUsed,
          totalPrice: countTotalPrice,
          paymentExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      if (body.pointsUsed)
        await tx.pointUsage.createMany({
          data: freeBatches.map((p) => ({
            transactionId: transaction.id,
            pointId: p.id,
            amount: p.amount,
          })),
        });

      await tx.event.update({
        where: {
          id: params.eventId,
        },
        data: {
          availableSeats: { decrement: body.quantity },
        },
      });

      return transaction;
    });
  }

  static async detail(
    { params }: GetDetailTrasanctionOutput,
    customerId: string,
  ) {
    const findTransaction = await prisma.transaction.findUnique({
      where: {
        id: params.transactionId,
        customerId,
      },
      include: {
        coupon: {
          select: {
            code: true,
          },
        },
        voucher: {
          select: {
            code: true,
          },
        },
        event: {
          select: {
            pricingType: true,
            organizerId: true,
          },
        },
      },
    });
    const findOrganizer = await prisma.organizer.findFirst({
      where: {
        id: findTransaction?.event.organizerId,
      },
      select: {
        bankName: true,
        bankAccountNumber: true,
        bankAccountHolder: true,
      },
    });

    if (!findTransaction) throw new AppError(404, 'Transaksi tidak ditemukan');

    return { findTransaction, findOrganizer };
  }

  static async payment({ params, file }: PaymentOutput, customerId: string) {
    const now = new Date();

    const checkTransactionId = await prisma.transaction.findUnique({
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
      throw new AppError(400, 'Batas waktu pembayaran sudah lewat');
    return await prisma.$transaction(
      async (tx) => {
        const cloudinaryUploadUrl = file
          ? ((await cloudionaryUpload(file.buffer, 'paymentProof')) as string)
          : undefined;

        const updated = await tx.transaction.updateMany({
          where: {
            id: params.transactionId,
            customerId,
            status: 'WAITING_PAYMENT',
            paymentExpiresAt: { gt: now },
          },
          data: {
            paymentProofUrl: cloudinaryUploadUrl,
            paymentProofUploadedAt: now,
            status: 'WAITING_CONFIRMATION',
            confirmDeadlineAt: new Date(
              now.getTime() + 3 * 24 * 60 * 60 * 1000,
            ),
          },
        });

        if (updated.count === 0)
          throw new AppError(409, 'Transaksi ini sudah tidak bisa dibayar');

        const result = await tx.transaction.findUnique({
          where: {
            id: params.transactionId,
          },
          include: {
            customer: true,
            event: true,
          },
        });

        const mainDir = path.join(process.cwd());
        const templateHTML = fs.readFileSync(
          `${mainDir}/src/templates/payment-succesfull.html`,
          'utf-8',
        );
        const templateHTMLCompiled = Handlebars.compile(templateHTML);
        const html = templateHTMLCompiled({
          customerName: result?.customer?.name ?? 'Customer',
          transactionId: result?.id ?? '',
          eventName: result?.event?.name,
          paymentDate: now.toLocaleDateString('id-ID'),
          amount: (result?.totalPrice ?? 0).toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }),
          profileUrl: 'http://localhost:3000/profile',
        });

        const mailer = await transporter.sendMail({
          to: result?.customer?.email,
          subject: 'Pembayaran Berhasil! Terima kasih sudah memesan di Lawang',
          html: html,
        });

        return result;
      },
      { timeout: 15000 },
    );
  }

  static async customerDetail(
    { query }: TransPaginationRequest,
    customerId: string,
  ) {
    const offset = (query.page - 1) * query.limit;

    const findTransaction = await prisma.transaction.findMany({
      where: {
        customerId,
      },
      include: {
        event: {
          select: {
            name: true,
            category: true,
            pricingType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: query.limit,
      skip: offset,
    });

    const totalData = await prisma.transaction.count({
      where: {
        customerId,
      },
    });

    const totalPage = Math.ceil(totalData / query.limit);
    const findCustomer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!findTransaction) throw new AppError(404, 'Transaksi tidak ditemukan');

    return { findTransaction, findCustomer, totalPage };
  }
}
