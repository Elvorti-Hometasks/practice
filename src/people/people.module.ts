import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Person } from './person.entity';
import { Planet } from '../planets/planet.entity';
import { Species } from '../species/species.entity';
import { Starship } from '../starships/starship.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Film } from '../films/film.entity';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';
import { PeopleRepository } from './people.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person, Planet, Species, Starship, Vehicle, Film]),
  ],
  controllers: [PeopleController],
  providers: [PeopleService, PeopleRepository],
  exports: [PeopleService, PeopleRepository],
})
export class PeopleModule {}
