import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountriesModule } from '../countries/countries.module.js';
import { Especie, Pais } from '../database/entities/index.js';
import { SpeciesModule } from '../species/species.module.js';
import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Especie, Pais]),
    SpeciesModule,
    CountriesModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
