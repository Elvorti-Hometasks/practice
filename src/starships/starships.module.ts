import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Starship } from './starship.entity';
import { StarshipsController } from './starships.controller';
import { StarshipsService } from './starships.service';
import { StarshipsRepository } from './starships.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Starship])],
  controllers: [StarshipsController],
  providers: [StarshipsService, StarshipsRepository],
  exports: [StarshipsService, StarshipsRepository],
})
export class StarshipsModule {}
