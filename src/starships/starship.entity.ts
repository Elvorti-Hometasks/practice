import { Column, Entity, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '../common/entities/base.entity';
import { Person } from '../people/person.entity';
import { Film } from '../films/film.entity';

@Entity({ name: 'starships' })
export class Starship extends BaseEntity {
  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  model!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturer!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  costInCredits!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  length!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  maxAtmospheringSpeed!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  crew!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  passengers!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  cargoCapacity!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  consumables!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  hyperdriveRating!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  MGLT!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  starshipClass!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  swapiUrl!: string | null;

  @ManyToMany(() => Person, (p) => p.starships)
  pilots!: Person[];

  // inverse, Film owns
  @ManyToMany(() => Film, (f) => f.starships)
  films!: Film[];
}
