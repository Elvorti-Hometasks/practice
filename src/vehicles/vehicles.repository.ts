import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Vehicle } from './vehicle.entity';

@Injectable()
export class VehiclesRepository {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repo: Repository<Vehicle>,
  ) {}

  create(data: Partial<Vehicle>): Vehicle {
    return this.repo.create(data);
  }

  save(v: Vehicle): Promise<Vehicle> {
    return this.repo.save(v);
  }

  findPage(skip: number, take: number): Promise<[Vehicle[], number]> {
    return this.repo.findAndCount({
      relations: { pilots: true, films: true },
      order: { id: 'DESC' },
      skip,
      take,
    });
  }

  findById(id: number): Promise<Vehicle | null> {
    return this.repo.findOne({
      where: { id },
      relations: { pilots: true, films: true },
    });
  }

  findBySwapiUrl(url: string): Promise<Vehicle | null> {
    return this.repo.findOne({ where: { swapiUrl: url } });
  }

  async remove(v: Vehicle): Promise<void> {
    await this.repo.remove(v);
  }
}
