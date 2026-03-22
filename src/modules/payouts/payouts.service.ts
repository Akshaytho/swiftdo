import { prisma } from '../../lib/prisma';
import { parsePagination, paginatedResponse } from '../../lib/utils';

export class PayoutsService {
  async listWorkerPayouts(workerId: string, query: { page?: string; limit?: string }) {
    const pagination = parsePagination(query);

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where: { workerId },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          task: { select: { id: true, title: true, category: true } },
        },
      }),
      prisma.payout.count({ where: { workerId } }),
    ]);

    // Summary stats
    const stats = await prisma.payout.aggregate({
      where: { workerId },
      _sum: { amountCents: true },
      _count: true,
    });

    const completed = await prisma.payout.aggregate({
      where: { workerId, status: 'COMPLETED' },
      _sum: { amountCents: true },
    });

    return {
      ...paginatedResponse(payouts, total, pagination),
      summary: {
        totalEarnedCents: stats._sum.amountCents ?? 0,
        totalPaidCents: completed._sum.amountCents ?? 0,
        pendingCents: (stats._sum.amountCents ?? 0) - (completed._sum.amountCents ?? 0),
        totalPayouts: stats._count,
      },
    };
  }
}

export const payoutsService = new PayoutsService();
