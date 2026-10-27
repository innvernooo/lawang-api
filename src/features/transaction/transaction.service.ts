import { prisma } from '../../configs/prisma-client.config';
import { AppError } from '../../errors/app.error';
import { cloudionaryUpload } from '../../lib/cloudinary.lib';
import {
  CreateTransactionOutput,
  GetDetailTrasanctionOutput,
  PaymentOutput,
  pointStep,
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
      throw new AppError(404, 'Event Id does not exist or end date is over');

    const checkTicketTypeId = await prisma.ticketType.findUnique({
      where: {
        id: body.ticketTypeId,
        eventId: params.eventId,
      },
    });

    if (!checkTicketTypeId)
      throw new AppError(
        404,
        'Ticket type Id does not match or it does not belong to the event',
      );
    if (checkTicketTypeId.endSale && checkTicketTypeId.endSale < now)
      throw new AppError(400, 'Ticket sale has ended');

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
      throw new AppError(404, 'Coupon code does not match or it has expired');

    const checkVoucherCode = body.voucherCode
      ? await prisma.voucher.findUnique({
          where: {
            eventId_code: { eventId: params.eventId, code: body.voucherCode },
          },
        })
      : null;

    if (body.voucherCode) {
      if (!checkVoucherCode)
        throw new AppError(404, 'Voucher code does not exist for this event');
      if (checkVoucherCode.startDate > now)
        throw new AppError(400, 'Voucher is not active yet');
      if (checkVoucherCode.endDate <= now)
        throw new AppError(400, 'Voucher has expired');
      if (
        checkVoucherCode.quota !== null &&
        checkVoucherCode.usedCount >= checkVoucherCode.quota
      )
        throw new AppError(400, 'Voucher quota is full');
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
        throw new AppError(400, 'Point usage is more higher than total price');

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
        throw new AppError(400, 'Not enough ticket available');

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
          throw new AppError(400, 'Voucher quota is full');
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
          throw new AppError(400, 'Coupon cannot be used');
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
        throw new AppError(400, 'Point is not enough');

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
      },
    });

    if (!findTransaction) throw new AppError(404, 'Transaction not found');

    return findTransaction;
  }

  static async payment({ params, file }: PaymentOutput, customerId: string) {
    const now = new Date();

    const checkTransactionId = await prisma.transaction.findUnique({
      where: {
        id: params.transactionId,
        customerId,
      },
    });

    if (!checkTransactionId) throw new AppError(404, 'Transaction not found');
    if (checkTransactionId.status !== 'WAITING_PAYMENT')
      throw new AppError(409, 'Transaction is not waiting for payment');
    if (
      checkTransactionId.paymentExpiresAt &&
      checkTransactionId.paymentExpiresAt <= now
    )
      throw new AppError(400, 'Payment time has expired');

    const cloudinaryUploadUrl = (await cloudionaryUpload(
      file.buffer,
      'paymentProof',
    )) as string;

    const updated = await prisma.transaction.updateMany({
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
        confirmDeadlineAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      },
    });

    if (updated.count === 0)
      throw new AppError(409, 'Transaction can no longer be paid');

    return await prisma.transaction.findUnique({
      where: {
        id: params.transactionId,
      },
    });
  }
}
