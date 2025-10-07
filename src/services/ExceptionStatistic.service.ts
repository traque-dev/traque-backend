import { dayjs } from 'core/utils/dayjs';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DailyExceptionStatisticDto } from 'models/dto/DailyExceptionStatistic.dto';
import { Exception } from 'models/entity/Exception.entity';
import { Project } from 'models/entity/Project.entity';

@Injectable()
export class ExceptionStatisticService {
  constructor(
    @InjectRepository(Exception)
    private readonly exceptionRepository: Repository<Exception>,
  ) {}

  async getDailyStatistic(
    project: Project,
    from?: Date,
    to?: Date,
  ): Promise<Array<DailyExceptionStatisticDto>> {
    const query = this.exceptionRepository
      .createQueryBuilder('e')
      .select("to_char(date_trunc('day', e.created_at), 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)::int', 'count')
      .where('e.project_id = :projectId', { projectId: project.id });

    const startOfDay = from ? dayjs(from).startOf('day').toDate() : undefined;
    const endOfDay = to ? dayjs(to).endOf('day').toDate() : undefined;

    if (startOfDay) {
      query.andWhere('e.created_at >= :from', { from: startOfDay });
    }

    if (endOfDay) {
      query.andWhere('e.created_at <= :to', { to: endOfDay });
    }

    const rows = await query
      .groupBy("date_trunc('day', e.created_at)")
      .orderBy("date_trunc('day', e.created_at)", 'ASC')
      .getRawMany<{ date: string; count: string }>();

    const countsByDate = new Map<string, number>(
      rows.map((r) => [r.date, Number(r.count)]),
    );

    // Ensure we return all dates between from and to (inclusive), filling zeros
    const start = dayjs(from).startOf('day');
    const end = dayjs(to).startOf('day');

    const result: DailyExceptionStatisticDto[] = [];
    let cursor = start.clone();
    while (cursor.isBefore(end) || cursor.isSame(end)) {
      const key = cursor.format('YYYY-MM-DD');
      result.push({ date: key, count: countsByDate.get(key) ?? 0 });
      cursor = cursor.add(1, 'day');
    }

    return result;
  }
}
