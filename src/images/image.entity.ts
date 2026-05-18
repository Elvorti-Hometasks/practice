import { Column, Entity, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from '../common/entities/base.entity';

// до яких сутностей можна чіпляти зображення
export type ImageOwnerType =
  | 'person'
  | 'planet'
  | 'film'
  | 'species'
  | 'starship'
  | 'vehicle';

export const IMAGE_OWNER_TYPES: ImageOwnerType[] = [
  'person',
  'planet',
  'film',
  'species',
  'starship',
  'vehicle',
];

@Entity({ name: 'images' })
@Index(['ownerType', 'ownerId'])
export class Image extends BaseEntity {
  @ApiProperty()
  @Column({ type: 'varchar', length: 64, unique: true })
  slug!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  filename!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  originalName!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 100 })
  mimeType!: string;

  @ApiProperty()
  @Column({ type: 'int' })
  sizeBytes!: number;

  @ApiProperty({ enum: IMAGE_OWNER_TYPES })
  @Column({ type: 'varchar', length: 32 })
  ownerType!: ImageOwnerType;

  @ApiProperty()
  @Column({ type: 'int' })
  ownerId!: number;
}
