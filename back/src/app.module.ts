import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BiomesModule } from './biomes/biomes.module.js';
import { CountriesModule } from './countries/countries.module.js';
import { dataSourceOptions } from './database/data-source.js';
import { HealthController } from './health/health.controller.js';
import { SearchModule } from './search/search.module.js';
import { SourcesModule } from './sources/sources.module.js';
import { SpeciesModule } from './species/species.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    CountriesModule,
    BiomesModule,
    SpeciesModule,
    SearchModule,
    SourcesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
