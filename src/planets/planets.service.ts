import { Injectable, NotFoundException } from '@nestjs/common';

import { Planet } from './planet.entity';
import { PlanetsRepository } from './planets.repository';
import { CreatePlanetDto } from './dto/create-planet.dto';
import { UpdatePlanetDto } from './dto/update-planet.dto';
import {
  buildPagination,
  PaginatedResult,
  PaginationDto,
} from '../common/dto/pagination.dto';

@Injectable()
export class PlanetsService {
  constructor(private readonly planets: PlanetsRepository) {}

  async list(p: PaginationDto): Promise<PaginatedResult<Planet>> {
    const skip = (p.page - 1) * p.limit;
    const [items, total] = await this.planets.findPage(skip, p.limit);
    return buildPagination(items, total, p.page, p.limit);
  }

  async findOne(id: number): Promise<Planet> {
    const p = await this.planets.findById(id);
    if (!p) throw new NotFoundException(`Planet #${id} not found`);
    return p;
  }

  create(dto: CreatePlanetDto): Promise<Planet> {
    const planet = this.planets.create({
      name: dto.name,
      rotationPeriod: dto.rotationPeriod ?? null,
      orbitalPeriod: dto.orbitalPeriod ?? null,
      diameter: dto.diameter ?? null,
      climate: dto.climate ?? null,
      gravity: dto.gravity ?? null,
      terrain: dto.terrain ?? null,
      surfaceWater: dto.surfaceWater ?? null,
      population: dto.population ?? null,
    });
    return this.planets.save(planet);
  }

  async update(id: number, dto: UpdatePlanetDto): Promise<Planet> {
    const p = await this.findOne(id);
    Object.assign(p, dto);
    return this.planets.save(p);
  }

  async remove(id: number): Promise<void> {
    const p = await this.findOne(id);
    await this.planets.remove(p);
  }
}
