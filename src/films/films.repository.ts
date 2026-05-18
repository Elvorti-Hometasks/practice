import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Film } from './film.entity';

@Injectable()
export class FilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly repo: Repository<Film>,
  ) {}

  create(data: Partial<Film>): Film {
    return this.repo.create(data);
  }

  save(f: Film): Promise<Film> {
    return this.repo.save(f);
  }

  findPage(skip: number, take: number): Promise<[Film[], number]> {
    return this.repo.findAndCount({
      relations: {
        characters: true,
        planets: true,
        species: true,
        starships: true,
        vehicles: true,
      },
      order: { id: 'DESC' },
      skip,
      take,
    });
  }

  findById(id: number): Promise<Film | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        characters: true,
        planets: true,
        species: true,
        starships: true,
        vehicles: true,
      },
    });
  }

  findBySwapiUrl(url: string): Promise<Film | null> {
    return this.repo.findOne({ where: { swapiUrl: url } });
  }

  async remove(f: Film): Promise<void> {
    await this.repo.remove(f);
  }
}
