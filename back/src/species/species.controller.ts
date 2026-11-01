import { Controller, Get, Param, Query } from '@nestjs/common';
import { booleanQuery, singleQuery } from '../common/query.js';
import { SpeciesService } from './species.service.js';

@Controller('species')
export class SpeciesController {
  constructor(private readonly species: SpeciesService) {}

  /**
   * GET /species?country=br&biome=cerrado   (getSpeciesInBiome)
   * GET /species?country=br&featured=true   (getFeaturedSpecies)
   * Todos os filtros são opcionais.
   */
  @Get()
  list(
    @Query('country') country: unknown,
    @Query('biome') biome: unknown,
    @Query('featured') featured: unknown,
  ) {
    return this.species.list({
      country: singleQuery(country, 'country'),
      biome: singleQuery(biome, 'biome'),
      featured: booleanQuery(featured, 'featured'),
    });
  }

  /** GET /species/panthera-onca */
  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.species.detail(slug);
  }

  /** GET /species/panthera-onca/related */
  @Get(':slug/related')
  related(@Param('slug') slug: string) {
    return this.species.related(slug);
  }
}
