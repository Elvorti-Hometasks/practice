import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PeopleService } from './people.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './person.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('people')
@Controller('people')
export class PeopleController {
  constructor(private readonly svc: PeopleService) {}

  @Get()
  @ApiOperation({ summary: 'Сторінка персонажів (останні створені)' })
  @ApiOkResponse({ description: 'Paginated list of people' })
  list(@Query() q: PaginationDto) {
    return this.svc.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Один персонаж' })
  @ApiResponse({ status: 200, type: Person })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Створити персонажа' })
  create(@Body() dto: CreatePersonDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Оновити персонажа' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonDto,
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити персонажа' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
