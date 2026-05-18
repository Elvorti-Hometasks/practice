import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '../common/entities/base.entity';
import { Person } from '../people/person.entity';
import { Film } from '../films/film.entity';
import { Species } from '../species/species.entity';

@Entity({ name: 'planets' })
export class Planet extends BaseEntity {
  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  rotationPeriod!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  orbitalPeriod!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  diameter!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  climate!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  gravity!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  terrain!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  surfaceWater!: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 64, nullable: true })
  population!: string | null;

  // оригінальний swapi URL - використовується сідером для матчингу зв'язків
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  swapiUrl!: string | null;

  @OneToMany(() => Person, (p) => p.homeworld)
  residents!: Person[];

  @OneToMany(() => Species, (s) => s.homeworld)
  nativeSpecies!: Species[];

  // обернений бік M2M, owning side у Film
  @ManyToMany(() => Film, (f) => f.planets)
  films!: Film[];
}
