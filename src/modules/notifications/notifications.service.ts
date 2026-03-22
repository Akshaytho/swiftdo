import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../lib/errors';
import { parsePagination, paginatedResponse } from '../../lib/utils';

export class NotificationsService {
  async listForUser(userId: string, query: { page?: string; limit?: string }) {
    const pagination = parsePagination(query);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { ...paginatedResponse(notifications, total, pagination), unreadCount };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new NotFoundError('Notification', notificationId);
    if (notification.userId !== userId) throw new NotFoundError('Notification', notificationId);

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { markedCount: result.count };
  }
}

export const notificationsService = new NotificationsService();
