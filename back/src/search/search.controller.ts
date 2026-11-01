import { Controller, Get, Query } from '@nestjs/common';
import { singleQuery } from '../common/query.js';
import { SearchService } from './search.service.js';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /** GET /search?q=onca (sem acento e sem diferença de maiúscula) */
  @Get()
  search(@Query('q') q: unknown) {
    return this.searchService.search(singleQuery(q, 'q'));
  }
}
