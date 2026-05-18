import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '../common/entities/base.entity';
import { Planet } from '../planets/planet.entity';
import { Species } from '../species/species.entity';
import { Starship } from '../starships/starship.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Film } from '../films/film.entity';

@Entity({ name: 'people' })
export class Person extends BaseEntity {
  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  height!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  mass!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 128, nullable: true })
  hairColor!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 128, nullable: true })
  skinColor!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 128, nullable: true })
  eyeColor!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  birthYear!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 32, nullable: true })
  gender!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  swapiUrl!: string | null;

  @ManyToOne(() => Planet, (planet) => planet.residents, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'homeworld_id' })
  homeworld!: Planet | null;

  @ManyToMany(() => Species, (s) => s.people)
  @JoinTable({
    name: 'people_species',
    joinColumn: { name: 'person_id' },
    inverseJoinColumn: { name: 'species_id' },
  })
  species!: Species[];

  @ManyToMany(() => Starship, (s) => s.pilots)
  @JoinTable({
    name: 'people_starships',
    joinColumn: { name: 'person_id' },
    inverseJoinColumn: { name: 'starship_id' },
  })
  starships!: Starship[];

  @ManyToMany(() => Vehicle, (v) => v.pilots)
  @JoinTable({
    name: 'people_vehicles',
    joinColumn: { name: 'person_id' },
    inverseJoinColumn: { name: 'vehicle_id' },
  })
  vehicles!: Vehicle[];

  // обернений бік (owner = Film)
  @ManyToMany(() => Film, (f) => f.characters)
  films!: Film[];
}
