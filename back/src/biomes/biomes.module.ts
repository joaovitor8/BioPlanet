import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiomaGlobal } from '../database/entities/index.js';
import { BiomesController } from './biomes.controller.js';
import { BiomesService } from './biomes.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([BiomaGlobal])],
  controllers: [BiomesController],
  providers: [BiomesService],
  exports: [BiomesService],
})
export class BiomesModule {}
