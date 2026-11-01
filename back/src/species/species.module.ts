import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiomaNacional, Especie, Pais } from '../database/entities/index.js';
import { SpeciesController } from './species.controller.js';
import { SpeciesService } from './species.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Especie, Pais, BiomaNacional])],
  controllers: [SpeciesController],
  providers: [SpeciesService],
  exports: [SpeciesService],
})
export class SpeciesModule {}
