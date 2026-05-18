import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Starship } from './starship.entity';

@Injectable()
export class StarshipsRepository {
  constructor(
    @InjectRepository(Starship)
    private readonly repo: Repository<Starship>,
  ) {}

  create(data: Partial<Starship>): Starship {
    return this.repo.create(data);
  }

  save(s: Starship): Promise<Starship> {
    return this.repo.save(s);
  }

  findPage(skip: number, take: number): Promise<[Starship[], number]> {
    return this.repo.findAndCount({
      relations: { pilots: true, films: true },
      order: { id: 'DESC' },
      skip,
      take,
    });
  }

  findById(id: number): Promise<Starship | null> {
    return this.repo.findOne({
      where: { id },
      relations: { pilots: true, films: true },
    });
  }

  findBySwapiUrl(url: string): Promise<Starship | null> {
    return this.repo.findOne({ where: { swapiUrl: url } });
  }

  async remove(s: Starship): Promise<void> {
    await this.repo.remove(s);
  }
}
