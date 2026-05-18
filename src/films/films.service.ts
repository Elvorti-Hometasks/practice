import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Film } from './film.entity';
import { FilmsRepository } from './films.repository';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { Person } from '../people/person.entity';
import { Planet } from '../planets/planet.entity';
import { Species } from '../species/species.entity';
import { Starship } from '../starships/starship.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import {
  buildPagination,
  PaginatedResult,
  PaginationDto,
} from '../common/dto/pagination.dto';

@Injectable()
export class FilmsService {
  constructor(
    private readonly films: FilmsRepository,
    @InjectRepository(Person) private readonly personRepo: Repository<Person>,
    @InjectRepository(Planet) private readonly planetRepo: Repository<Planet>,
    @InjectRepository(Species)
    private readonly speciesRepo: Repository<Species>,
    @InjectRepository(Starship)
    private readonly starshipRepo: Repository<Starship>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
  ) {}

  async list(p: PaginationDto): Promise<PaginatedResult<Film>> {
    const skip = (p.page - 1) * p.limit;
    const [items, total] = await this.films.findPage(skip, p.limit);
    return buildPagination(items, total, p.page, p.limit);
  }

  async findOne(id: number): Promise<Film> {
    const f = await this.films.findById(id);
    if (!f) throw new NotFoundException(`Film #${id} not found`);
    return f;
  }

  async create(dto: CreateFilmDto): Promise<Film> {
    const film = this.films.create({
      title: dto.title,
      episodeId: dto.episodeId,
      openingCrawl: dto.openingCrawl,
      director: dto.director,
      producer: dto.producer,
      releaseDate: dto.releaseDate,
    });
    await this.applyRelations(film, dto);
    return this.films.save(film);
  }

  async update(id: number, dto: UpdateFilmDto): Promise<Film> {
    const film = await this.findOne(id);
    if (dto.title !== undefined) film.title = dto.title;
    if (dto.episodeId !== undefined) film.episodeId = dto.episodeId;
    if (dto.openingCrawl !== undefined) film.openingCrawl = dto.openingCrawl;
    if (dto.director !== undefined) film.director = dto.director;
    if (dto.producer !== undefined) film.producer = dto.producer;
    if (dto.releaseDate !== undefined) film.releaseDate = dto.releaseDate;
    await this.applyRelations(film, dto);
    return this.films.save(film);
  }

  async remove(id: number): Promise<void> {
    const f = await this.findOne(id);
    await this.films.remove(f);
  }

  private async applyRelations(
    film: Film,
    dto: CreateFilmDto | UpdateFilmDto,
  ): Promise<void> {
    if (dto.charactersIds) {
      film.characters = await this.fetchMany(
        this.personRepo,
        dto.charactersIds,
        'charactersIds',
      );
    }
    if (dto.planetsIds) {
      film.planets = await this.fetchMany(
        this.planetRepo,
        dto.planetsIds,
        'planetsIds',
      );
    }
    if (dto.speciesIds) {
      film.species = await this.fetchMany(
        this.speciesRepo,
        dto.speciesIds,
        'speciesIds',
      );
    }
    if (dto.starshipsIds) {
      film.starships = await this.fetchMany(
        this.starshipRepo,
        dto.starshipsIds,
        'starshipsIds',
      );
    }
    if (dto.vehiclesIds) {
      film.vehicles = await this.fetchMany(
        this.vehicleRepo,
        dto.vehiclesIds,
        'vehiclesIds',
      );
    }
  }

  private async fetchMany<T extends { id: number }>(
    repo: Repository<T>,
    ids: number[],
    field: string,
  ): Promise<T[]> {
    if (!ids.length) return [];
    const found = await repo.find({ where: { id: In(ids) } as never });
    if (found.length !== ids.length) {
      const have = new Set(found.map((x) => x.id));
      const missing = ids.filter((x) => !have.has(x));
      throw new BadRequestException(
        `${field}: not found ids ${missing.join(', ')}`,
      );
    }
    return found;
  }
}
