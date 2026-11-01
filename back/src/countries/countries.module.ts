import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiomesModule } from '../biomes/biomes.module.js';
import { BiomaNacional, Pais } from '../database/entities/index.js';
import { SourcesModule } from '../sources/sources.module.js';
import { CountriesController } from './countries.controller.js';
import { CountriesService } from './countries.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pais, BiomaNacional]),
    BiomesModule,
    SourcesModule,
  ],
  controllers: [CountriesController],
  providers: [CountriesService],
  exports: [CountriesService],
})
export class CountriesModule {}
