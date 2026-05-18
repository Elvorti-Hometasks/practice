import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Image, ImageOwnerType } from './image.entity';

@Injectable()
export class ImagesRepository {
  constructor(
    @InjectRepository(Image)
    private readonly repo: Repository<Image>,
  ) {}

  create(data: Partial<Image>): Image {
    return this.repo.create(data);
  }

  save(img: Image): Promise<Image> {
    return this.repo.save(img);
  }

  findById(id: number): Promise<Image | null> {
    return this.repo.findOne({ where: { id } });
  }

  findBySlug(slug: string): Promise<Image | null> {
    return this.repo.findOne({ where: { slug } });
  }

  findForOwner(type: ImageOwnerType, ownerId: number): Promise<Image[]> {
    return this.repo.find({
      where: { ownerType: type, ownerId },
      order: { id: 'ASC' },
    });
  }

  async remove(img: Image): Promise<void> {
    await this.repo.remove(img);
  }
}
