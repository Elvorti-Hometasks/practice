import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Planet } from './planet.entity';
import { PlanetsController } from './planets.controller';
import { PlanetsService } from './planets.service';
import { PlanetsRepository } from './planets.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Planet])],
  controllers: [PlanetsController],
  providers: [PlanetsService, PlanetsRepository],
  exports: [PlanetsService, PlanetsRepository],
})
export class PlanetsModule {}
