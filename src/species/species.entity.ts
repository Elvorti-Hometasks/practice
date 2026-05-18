import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '../common/entities/base.entity';
import { Planet } from '../planets/planet.entity';
import { Person } from '../people/person.entity';
import { Film } from '../films/film.entity';

@Entity({ name: 'species' })
export class Species extends BaseEntity {
  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  classification!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  designation!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  averageHeight!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  skinColors!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  hairColors!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  eyeColors!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  averageLifespan!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 128, nullable: true })
  language!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  swapiUrl!: string | null;

  @ManyToOne(() => Planet, (p) => p.nativeSpecies, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'homeworld_id' })
  homeworld!: Planet | null;

  @ManyToMany(() => Person, (p) => p.species)
  people!: Person[];

  // обернений бік (Film володіє)
  @ManyToMany(() => Film, (f) => f.species)
  films!: Film[];
}
