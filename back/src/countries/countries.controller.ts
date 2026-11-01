import { Controller, Get, Param } from '@nestjs/common';
import { CountriesService } from './countries.service.js';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countries: CountriesService) {}

  /** GET /countries */
  @Get()
  list() {
    return this.countries.list();
  }

  /** GET /countries/br */
  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.countries.detail(slug);
  }

  /** GET /countries/br/biomes/cerrado */
  @Get(':slug/biomes/:biome')
  biome(@Param('slug') slug: string, @Param('biome') biome: string) {
    return this.countries.biome(slug, biome);
  }
}
