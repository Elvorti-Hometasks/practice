import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Person } from './person.entity';

@Injectable()
export class PeopleRepository {
  constructor(
    @InjectRepository(Person)
    private readonly repo: Repository<Person>,
  ) {}

  create(person: Partial<Person>): Person {
    return this.repo.create(person);
  }

  save(person: Person): Promise<Person> {
    return this.repo.save(person);
  }

  async findPage(
    skip: number,
    take: number,
  ): Promise<[Person[], number]> {
    return this.repo.findAndCount({
      relations: {
        homeworld: true,
        species: true,
        films: true,
        starships: true,
        vehicles: true,
      },
      order: { id: 'DESC' },
      skip,
      take,
    });
  }

  findById(id: number): Promise<Person | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        homeworld: true,
        species: true,
        films: true,
        starships: true,
        vehicles: true,
      },
    });
  }

  findBySwapiUrl(url: string): Promise<Person | null> {
    return this.repo.findOne({ where: { swapiUrl: url } });
  }

  findByIds(ids: number[]): Promise<Person[]> {
    if (!ids.length) return Promise.resolve([]);
    return this.repo.find({ where: { id: In(ids) } });
  }

  async remove(person: Person): Promise<void> {
    await this.repo.remove(person);
  }
}
