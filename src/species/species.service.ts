import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Species } from './species.entity';
import { SpeciesRepository } from './species.repository';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { Planet } from '../planets/planet.entity';
import {
  buildPagination,
  PaginatedResult,
  PaginationDto,
} from '../common/dto/pagination.dto';

@Injectable()
export class SpeciesService {
  constructor(
    private readonly species: SpeciesRepository,
    @InjectRepository(Planet) private readonly planetRepo: Repository<Planet>,
  ) {}

  async list(p: PaginationDto): Promise<PaginatedResult<Species>> {
    const skip = (p.page - 1) * p.limit;
    const [items, total] = await this.species.findPage(skip, p.limit);
    return buildPagination(items, total, p.page, p.limit);
  }

  async findOne(id: number): Promise<Species> {
    const s = await this.species.findById(id);
    if (!s) throw new NotFoundException(`Species #${id} not found`);
    return s;
  }

  async create(dto: CreateSpeciesDto): Promise<Species> {
    const sp = this.species.create({
      name: dto.name,
      classification: dto.classification ?? null,
      designation: dto.designation ?? null,
      averageHeight: dto.averageHeight ?? null,
      skinColors: dto.skinColors ?? null,
      hairColors: dto.hairColors ?? null,
      eyeColors: dto.eyeColors ?? null,
      averageLifespan: dto.averageLifespan ?? null,
      language: dto.language ?? null,
    });
    if (dto.homeworldId !== undefined) {
      sp.homeworld = await this.resolvePlanet(dto.homeworldId);
    }
    return this.species.save(sp);
  }

  async update(id: number, dto: UpdateSpeciesDto): Promise<Species> {
    const sp = await this.findOne(id);
    if (dto.name !== undefined) sp.name = dto.name;
    if (dto.classification !== undefined) sp.classification = dto.classification;
    if (dto.designation !== undefined) sp.designation = dto.designation;
    if (dto.averageHeight !== undefined) sp.averageHeight = dto.averageHeight;
    if (dto.skinColors !== undefined) sp.skinColors = dto.skinColors;
    if (dto.hairColors !== undefined) sp.hairColors = dto.hairColors;
    if (dto.eyeColors !== undefined) sp.eyeColors = dto.eyeColors;
    if (dto.averageLifespan !== undefined) sp.averageLifespan = dto.averageLifespan;
    if (dto.language !== undefined) sp.language = dto.language;
    if (dto.homeworldId !== undefined) {
      sp.homeworld = await this.resolvePlanet(dto.homeworldId);
    }
    return this.species.save(sp);
  }

  async remove(id: number): Promise<void> {
    const s = await this.findOne(id);
    await this.species.remove(s);
  }

  private async resolvePlanet(id: number | null): Promise<Planet | null> {
    if (id === null) return null;
    const planet = await this.planetRepo.findOne({ where: { id } });
    if (!planet) {
      throw new BadRequestException(`homeworldId ${id} does not exist`);
    }
    return planet;
  }
}
