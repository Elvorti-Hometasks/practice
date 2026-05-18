import { Injectable, NotFoundException } from '@nestjs/common';

import { Starship } from './starship.entity';
import { StarshipsRepository } from './starships.repository';
import { CreateStarshipDto } from './dto/create-starship.dto';
import { UpdateStarshipDto } from './dto/update-starship.dto';
import {
  buildPagination,
  PaginatedResult,
  PaginationDto,
} from '../common/dto/pagination.dto';

@Injectable()
export class StarshipsService {
  constructor(private readonly starships: StarshipsRepository) {}

  async list(p: PaginationDto): Promise<PaginatedResult<Starship>> {
    const skip = (p.page - 1) * p.limit;
    const [items, total] = await this.starships.findPage(skip, p.limit);
    return buildPagination(items, total, p.page, p.limit);
  }

  async findOne(id: number): Promise<Starship> {
    const s = await this.starships.findById(id);
    if (!s) throw new NotFoundException(`Starship #${id} not found`);
    return s;
  }

  create(dto: CreateStarshipDto): Promise<Starship> {
    const s = this.starships.create({
      name: dto.name,
      model: dto.model ?? null,
      manufacturer: dto.manufacturer ?? null,
      costInCredits: dto.costInCredits ?? null,
      length: dto.length ?? null,
      maxAtmospheringSpeed: dto.maxAtmospheringSpeed ?? null,
      crew: dto.crew ?? null,
      passengers: dto.passengers ?? null,
      cargoCapacity: dto.cargoCapacity ?? null,
      consumables: dto.consumables ?? null,
      hyperdriveRating: dto.hyperdriveRating ?? null,
      MGLT: dto.MGLT ?? null,
      starshipClass: dto.starshipClass ?? null,
    });
    return this.starships.save(s);
  }

  async update(id: number, dto: UpdateStarshipDto): Promise<Starship> {
    const s = await this.findOne(id);
    Object.assign(s, dto);
    return this.starships.save(s);
  }

  async remove(id: number): Promise<void> {
    const s = await this.findOne(id);
    await this.starships.remove(s);
  }
}
