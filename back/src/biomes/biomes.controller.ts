import { Controller, Get } from '@nestjs/common';
import { BiomesService } from './biomes.service.js';

@Controller('biomes')
export class BiomesController {
  constructor(private readonly biomes: BiomesService) {}

  /** GET /biomes */
  @Get()
  list() {
    return this.biomes.listGlobal();
  }
}
