import { prisma } from '../../lib/prisma';
import { createModuleLogger } from '../../lib/logger';
import { parsePagination, paginatedResponse } from '../../lib/utils';
import type { CreateReportDto } from './citizen-reports.schema';

const log = createModuleLogger('citizen-reports.service');

export class CitizenReportsService {
  async createReport(userId: string, dto: CreateReportDto) {
    const report = await prisma.citizenReport.create({
      data: {
        userId,
        category: dto.issueType,
        description: dto.description,
        locationLat: dto.lat ?? null,
        locationLng: dto.lng ?? null,
        locationAddress: dto.locationText ?? null,
        photoUrl: dto.photoUrl ?? null,
        status: 'REPORTED',
      },
    });

    log.info({ reportId: report.id, userId, category: dto.issueType }, 'Citizen report created');
    return report;
  }

  async listUserReports(userId: string, query: { page?: string; limit?: string }) {
    const pagination = parsePagination(query);

    const [reports, total] = await Promise.all([
      prisma.citizenReport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.citizenReport.count({ where: { userId } }),
    ]);

    return paginatedResponse(reports, total, pagination);
  }
}

export const citizenReportsService = new CitizenReportsService();
