import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Species } from './species.entity';
import { Planet } from '../planets/planet.entity';
import { SpeciesController } from './species.controller';
import { SpeciesService } from './species.service';
import { SpeciesRepository } from './species.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Species, Planet])],
  controllers: [SpeciesController],
  providers: [SpeciesService, SpeciesRepository],
  exports: [SpeciesService, SpeciesRepository],
})
export class SpeciesModule {}
