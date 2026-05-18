import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Species } from './species.entity';

@Injectable()
export class SpeciesRepository {
  constructor(
    @InjectRepository(Species)
    private readonly repo: Repository<Species>,
  ) {}

  create(data: Partial<Species>): Species {
    return this.repo.create(data);
  }

  save(s: Species): Promise<Species> {
    return this.repo.save(s);
  }

  findPage(skip: number, take: number): Promise<[Species[], number]> {
    return this.repo.findAndCount({
      relations: { homeworld: true, people: true, films: true },
      order: { id: 'DESC' },
      skip,
      take,
    });
  }

  findById(id: number): Promise<Species | null> {
    return this.repo.findOne({
      where: { id },
      relations: { homeworld: true, people: true, films: true },
    });
  }

  findBySwapiUrl(url: string): Promise<Species | null> {
    return this.repo.findOne({ where: { swapiUrl: url } });
  }

  async remove(s: Species): Promise<void> {
    await this.repo.remove(s);
  }
}
