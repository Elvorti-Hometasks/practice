import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Person } from './person.entity';
import { PeopleRepository } from './people.repository';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Planet } from '../planets/planet.entity';
import { Species } from '../species/species.entity';
import { Starship } from '../starships/starship.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Film } from '../films/film.entity';
import {
  buildPagination,
  PaginatedResult,
  PaginationDto,
} from '../common/dto/pagination.dto';

@Injectable()
export class PeopleService {
  constructor(
    private readonly people: PeopleRepository,
    @InjectRepository(Planet) private readonly planetRepo: Repository<Planet>,
    @InjectRepository(Species)
    private readonly speciesRepo: Repository<Species>,
    @InjectRepository(Starship)
    private readonly starshipRepo: Repository<Starship>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Film) private readonly filmRepo: Repository<Film>,
  ) {}

  async list(p: PaginationDto): Promise<PaginatedResult<Person>> {
    const skip = (p.page - 1) * p.limit;
    const [items, total] = await this.people.findPage(skip, p.limit);
    return buildPagination(items, total, p.page, p.limit);
  }

  async findOne(id: number): Promise<Person> {
    const person = await this.people.findById(id);
    if (!person) throw new NotFoundException(`Person #${id} not found`);
    return person;
  }

  async create(dto: CreatePersonDto): Promise<Person> {
    const person = this.people.create({
      name: dto.name,
      height: dto.height ?? null,
      mass: dto.mass ?? null,
      hairColor: dto.hairColor ?? null,
      skinColor: dto.skinColor ?? null,
      eyeColor: dto.eyeColor ?? null,
      birthYear: dto.birthYear ?? null,
      gender: dto.gender ?? null,
    });
    await this.applyRelations(person, dto);
    return this.people.save(person);
  }

  async update(id: number, dto: UpdatePersonDto): Promise<Person> {
    const person = await this.findOne(id);
    if (dto.name !== undefined) person.name = dto.name;
    if (dto.height !== undefined) person.height = dto.height;
    if (dto.mass !== undefined) person.mass = dto.mass;
    if (dto.hairColor !== undefined) person.hairColor = dto.hairColor;
    if (dto.skinColor !== undefined) person.skinColor = dto.skinColor;
    if (dto.eyeColor !== undefined) person.eyeColor = dto.eyeColor;
    if (dto.birthYear !== undefined) person.birthYear = dto.birthYear;
    if (dto.gender !== undefined) person.gender = dto.gender;
    await this.applyRelations(person, dto);
    return this.people.save(person);
  }

  async remove(id: number): Promise<void> {
    const person = await this.findOne(id);
    await this.people.remove(person);
  }

  // спільна логіка для create/update - підвантажує всі зв'язки за айдішками
  private async applyRelations(
    person: Person,
    dto: CreatePersonDto | UpdatePersonDto,
  ): Promise<void> {
    if (dto.homeworldId !== undefined) {
      if (dto.homeworldId === null) {
        person.homeworld = null;
      } else {
        const planet = await this.planetRepo.findOne({
          where: { id: dto.homeworldId },
        });
        if (!planet) {
          throw new BadRequestException(
            `homeworldId ${dto.homeworldId} does not exist`,
          );
        }
        person.homeworld = planet;
      }
    }

    if (dto.speciesIds) {
      person.species = await this.fetchMany(
        this.speciesRepo,
        dto.speciesIds,
        'speciesIds',
      );
    }
    if (dto.starshipsIds) {
      person.starships = await this.fetchMany(
        this.starshipRepo,
        dto.starshipsIds,
        'starshipsIds',
      );
    }
    if (dto.vehiclesIds) {
      person.vehicles = await this.fetchMany(
        this.vehicleRepo,
        dto.vehiclesIds,
        'vehiclesIds',
      );
    }
    if (dto.filmsIds) {
      person.films = await this.fetchMany(
        this.filmRepo,
        dto.filmsIds,
        'filmsIds',
      );
    }
  }

  private async fetchMany<T extends { id: number }>(
    repo: Repository<T>,
    ids: number[],
    field: string,
  ): Promise<T[]> {
    if (ids.length === 0) return [];
    const found = await repo.find({ where: { id: In(ids) } as never });
    if (found.length !== ids.length) {
      const foundIds = new Set(found.map((x) => x.id));
      const missing = ids.filter((x) => !foundIds.has(x));
      throw new BadRequestException(
        `${field}: not found ids ${missing.join(', ')}`,
      );
    }
    return found;
  }
}
