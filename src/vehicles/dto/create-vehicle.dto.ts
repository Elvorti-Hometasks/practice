import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Sand Crawler' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  model?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  manufacturer?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(64)
  costInCredits?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(64)
  length?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(64)
  maxAtmospheringSpeed?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(64)
  crew?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(64)
  passengers?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(64)
  cargoCapacity?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(64)
  consumables?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255)
  vehicleClass?: string;
}
