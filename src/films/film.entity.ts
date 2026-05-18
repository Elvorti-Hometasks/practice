import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '../common/entities/base.entity';
import { Person } from '../people/person.entity';
import { Planet } from '../planets/planet.entity';
import { Species } from '../species/species.entity';
import { Starship } from '../starships/starship.entity';
import { Vehicle } from '../vehicles/vehicle.entity';

@Entity({ name: 'films' })
export class Film extends BaseEntity {
  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @ApiProperty()
  @Column({ type: 'int' })
  episodeId!: number;

  @ApiProperty()
  @Column({ type: 'text' })
  openingCrawl!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  director!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  producer!: string;

  @ApiProperty()
  @Column({ type: 'date' })
  releaseDate!: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  swapiUrl!: string | null;

  @ManyToMany(() => Person, (p) => p.films)
  @JoinTable({
    name: 'films_people',
    joinColumn: { name: 'film_id' },
    inverseJoinColumn: { name: 'person_id' },
  })
  characters!: Person[];

  @ManyToMany(() => Planet, (p) => p.films)
  @JoinTable({
    name: 'films_planets',
    joinColumn: { name: 'film_id' },
    inverseJoinColumn: { name: 'planet_id' },
  })
  planets!: Planet[];

  @ManyToMany(() => Species, (s) => s.films)
  @JoinTable({
    name: 'films_species',
    joinColumn: { name: 'film_id' },
    inverseJoinColumn: { name: 'species_id' },
  })
  species!: Species[];

  @ManyToMany(() => Starship, (s) => s.films)
  @JoinTable({
    name: 'films_starships',
    joinColumn: { name: 'film_id' },
    inverseJoinColumn: { name: 'starship_id' },
  })
  starships!: Starship[];

  @ManyToMany(() => Vehicle, (v) => v.films)
  @JoinTable({
    name: 'films_vehicles',
    joinColumn: { name: 'film_id' },
    inverseJoinColumn: { name: 'vehicle_id' },
  })
  vehicles!: Vehicle[];
}
