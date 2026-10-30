import { prisma } from '../configs/prisma-client.config';
import { restoreResources } from '../features/confirmation/confirm.helper';

export async function PaymentExpiring() {
  const now = new Date();

  const overdue = await prisma.transaction.findMany({
    where: {
      OR: [
        { status: 'WAITING_PAYMENT', paymentExpiresAt: { lte: now } },
        { status: 'WAITING_CONFIRMATION', confirmDeadlineAt: { lte: now } },
      ],
    },
    select: {
      id: true,
      status: true,
    },
    take: 100,
  });

  for (const t of overdue) {
    const changeStatus =
      t.status === 'WAITING_PAYMENT' ? 'EXPIRED' : 'CANCELED';

    try {
      await prisma.$transaction(async (tx) => {
        const [updated] = await tx.transaction.updateManyAndReturn({
          where: {
            id: t.id,
            status: t.status,
          },
          data: {
            status: changeStatus,
            decidedAt: now,
          },
        });

        if (!updated) return;

        await restoreResources(tx, updated, now);
      });
    } catch (error) {
      console.log(`Expiring gagal memproses transaksi ${t.id}`);
    }
  }
}
