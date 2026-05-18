import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import * as path from 'path';

import { ImagesService } from './images.service';

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    const dir = process.env.UPLOAD_DIR || './uploads';
    cb(null, path.resolve(dir));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = /^\.(jpe?g|png|webp|gif)$/.test(ext) ? ext : '';
    cb(null, `${randomUUID()}${safeExt}`);
  },
});

const MAX_FILES = 10;

@ApiTags('images')
@Controller()
export class ImagesController {
  constructor(private readonly svc: ImagesService) {}

  @Post('entities/:type/:id/images')
  @ApiOperation({ summary: 'Прив\'язати картинки до сутності' })
  @ApiParam({ name: 'type', enum: ['person', 'planet', 'film', 'species', 'starship', 'vehicle'] })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES, {
      storage,
      limits: {
        fileSize: (Number(process.env.MAX_UPLOAD_SIZE_MB) || 5) * 1024 * 1024,
      },
      fileFilter: ImagesService.fileFilter,
    }),
  )
  upload(
    @Param('type') type: string,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('no files uploaded');
    }
    return this.svc.attach(type, id, files);
  }

  @Get('entities/:type/:id/images')
  @ApiOperation({ summary: 'Список картинок сутності' })
  list(
    @Param('type') type: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.svc.listForOwner(type, id);
  }

  @Get('images/:slug/raw')
  @ApiOperation({
    summary: 'Сирий доступ до файлу за slug-ом (символічне посилання)',
  })
  async raw(@Param('slug') slug: string): Promise<StreamableFile> {
    const { stream } = await this.svc.openBySlug(slug);
    return stream;
  }

  @Delete('images/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити картинку' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
