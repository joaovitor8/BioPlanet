import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

/** GET /health — confirma que a API está no ar e conectada ao banco. */
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    try {
      await this.dataSource.query('select 1');
      return { status: 'ok', banco: 'conectado' };
    } catch {
      throw new ServiceUnavailableException({
        status: 'erro',
        banco: 'sem conexão',
      });
    }
  }
}
