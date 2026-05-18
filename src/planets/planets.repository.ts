import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Planet } from './planet.entity';

@Injectable()
export class PlanetsRepository {
  constructor(
    @InjectRepository(Planet)
    private readonly repo: Repository<Planet>,
  ) {}

  create(data: Partial<Planet>): Planet {
    return this.repo.create(data);
  }

  save(p: Planet): Promise<Planet> {
    return this.repo.save(p);
  }

  findPage(skip: number, take: number): Promise<[Planet[], number]> {
    return this.repo.findAndCount({
      relations: { residents: true, nativeSpecies: true, films: true },
      order: { id: 'DESC' },
      skip,
      take,
    });
  }

  findById(id: number): Promise<Planet | null> {
    return this.repo.findOne({
      where: { id },
      relations: { residents: true, nativeSpecies: true, films: true },
    });
  }

  findBySwapiUrl(url: string): Promise<Planet | null> {
    return this.repo.findOne({ where: { swapiUrl: url } });
  }

  async remove(p: Planet): Promise<void> {
    await this.repo.remove(p);
  }
}
