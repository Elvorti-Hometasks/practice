import { Injectable, NotFoundException } from '@nestjs/common';

import { Vehicle } from './vehicle.entity';
import { VehiclesRepository } from './vehicles.repository';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import {
  buildPagination,
  PaginatedResult,
  PaginationDto,
} from '../common/dto/pagination.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly vehicles: VehiclesRepository) {}

  async list(p: PaginationDto): Promise<PaginatedResult<Vehicle>> {
    const skip = (p.page - 1) * p.limit;
    const [items, total] = await this.vehicles.findPage(skip, p.limit);
    return buildPagination(items, total, p.page, p.limit);
  }

  async findOne(id: number): Promise<Vehicle> {
    const v = await this.vehicles.findById(id);
    if (!v) throw new NotFoundException(`Vehicle #${id} not found`);
    return v;
  }

  create(dto: CreateVehicleDto): Promise<Vehicle> {
    const v = this.vehicles.create({
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
      vehicleClass: dto.vehicleClass ?? null,
    });
    return this.vehicles.save(v);
  }

  async update(id: number, dto: UpdateVehicleDto): Promise<Vehicle> {
    const v = await this.findOne(id);
    Object.assign(v, dto);
    return this.vehicles.save(v);
  }

  async remove(id: number): Promise<void> {
    const v = await this.findOne(id);
    await this.vehicles.remove(v);
  }
}
