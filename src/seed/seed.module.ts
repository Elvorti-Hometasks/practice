import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedService } from './seed.service';
import { SwapiClient } from './swapi.client';
import { Person } from '../people/person.entity';
import { Planet } from '../planets/planet.entity';
import { Film } from '../films/film.entity';
import { Species } from '../species/species.entity';
import { Starship } from '../starships/starship.entity';
import { Vehicle } from '../vehicles/vehicle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person, Planet, Film, Species, Starship, Vehicle]),
  ],
  providers: [SeedService, SwapiClient],
  exports: [SeedService],
})
export class SeedModule {}
