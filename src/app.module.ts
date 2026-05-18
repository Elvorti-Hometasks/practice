import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PeopleModule } from './people/people.module';
import { PlanetsModule } from './planets/planets.module';
import { FilmsModule } from './films/films.module';
import { SpeciesModule } from './species/species.module';
import { StarshipsModule } from './starships/starships.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ImagesModule } from './images/images.module';
import { SeedModule } from './seed/seed.module';
import { typeOrmAsyncConfig } from './database/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmAsyncConfig,
    }),
    PeopleModule,
    PlanetsModule,
    FilmsModule,
    SpeciesModule,
    StarshipsModule,
    VehiclesModule,
    ImagesModule,
    SeedModule,
  ],
})
export class AppModule {}
