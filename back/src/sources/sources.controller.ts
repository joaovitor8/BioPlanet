import { Controller, Get, Query } from '@nestjs/common';
import { singleQuery } from '../common/query.js';
import { SourcesService } from './sources.service.js';

@Controller('sources')
export class SourcesController {
  constructor(private readonly sources: SourcesService) {}

  /** GET /sources?scope=global|nacional */
  @Get()
  list(@Query('scope') scope: unknown) {
    return this.sources.list(singleQuery(scope, 'scope'));
  }
}
