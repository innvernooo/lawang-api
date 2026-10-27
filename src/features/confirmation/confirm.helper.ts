import { Prisma, Transaction } from '../../generated/prisma/client';

export async function restoreResources(
  tx: Prisma.TransactionClient,
  trx: Transaction,
  now: Date,
) {
  if (trx.ticketTypeId) {
    await tx.ticketType.update({
      where: {
        id: trx.ticketTypeId,
      },
      data: {
        available: { increment: trx.quantity },
      },
    });
  }

  if (trx.couponId) {
    await tx.coupon.update({
      where: {
        id: trx.couponId,
      },
      data: {
        usedAt: null,
      },
    });
  }

  if (trx.voucherId) {
    await tx.voucher.update({
      where: {
        id: trx.voucherId,
      },
      data: {
        usedCount: { decrement: 1 },
      },
    });
  }

  await tx.pointUsage.updateMany({
    where: {
      transactionId: trx.id,
      restoredAt: null,
    },
    data: {
      restoredAt: now,
    },
  });

  await tx.event.update({
    where: {
      id: trx.eventId,
    },
    data: {
      availableSeats: { increment: trx.quantity },
    },
  });
}
