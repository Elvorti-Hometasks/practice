import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { Image, ImageOwnerType, IMAGE_OWNER_TYPES } from './image.entity';
import { ImagesRepository } from './images.repository';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

@Injectable()
export class ImagesService {
  private readonly uploadDir: string;
  private readonly maxBytes: number;

  constructor(
    private readonly images: ImagesRepository,
    cfg: ConfigService,
  ) {
    this.uploadDir = path.resolve(cfg.get<string>('UPLOAD_DIR', './uploads'));
    const mb = Number(cfg.get<string>('MAX_UPLOAD_SIZE_MB', '5'));
    this.maxBytes = mb * 1024 * 1024;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  isOwnerType(t: string): t is ImageOwnerType {
    return (IMAGE_OWNER_TYPES as string[]).includes(t);
  }

  private assertOwnerType(t: string): ImageOwnerType {
    if (!this.isOwnerType(t)) {
      throw new BadRequestException(
        `unknown entity type '${t}', allowed: ${IMAGE_OWNER_TYPES.join(', ')}`,
      );
    }
    return t;
  }

  async attach(
    type: string,
    ownerId: number,
    files: Express.Multer.File[],
  ): Promise<Image[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('no files');
    }
    const t = this.assertOwnerType(type);
    const saved: Image[] = [];
    for (const f of files) {
      if (!ALLOWED_MIME.has(f.mimetype)) {
        // дубль перевірки на випадок якщо multer.fileFilter пропустив
        await this.unlinkQuiet(f.path);
        throw new BadRequestException(
          `mime '${f.mimetype}' not allowed`,
        );
      }
      if (f.size > this.maxBytes) {
        await this.unlinkQuiet(f.path);
        throw new BadRequestException('file too big');
      }
      const slug = randomUUID();
      const img = this.images.create({
        slug,
        filename: path.basename(f.path),
        originalName: f.originalname,
        mimeType: f.mimetype,
        sizeBytes: f.size,
        ownerType: t,
        ownerId,
      });
      saved.push(await this.images.save(img));
    }
    return saved;
  }

  async listForOwner(type: string, ownerId: number): Promise<Image[]> {
    const t = this.assertOwnerType(type);
    return this.images.findForOwner(t, ownerId);
  }

  async openBySlug(slug: string): Promise<{
    stream: StreamableFile;
    mimeType: string;
    filename: string;
  }> {
    const img = await this.images.findBySlug(slug);
    if (!img) throw new NotFoundException('image not found');
    const filePath = path.join(this.uploadDir, img.filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('file is missing on disk');
    }
    const stream = fs.createReadStream(filePath);
    return {
      stream: new StreamableFile(stream, {
        type: img.mimeType,
        disposition: `inline; filename="${img.originalName}"`,
      }),
      mimeType: img.mimeType,
      filename: img.originalName,
    };
  }

  async remove(id: number): Promise<void> {
    const img = await this.images.findById(id);
    if (!img) throw new NotFoundException('image not found');
    const filePath = path.join(this.uploadDir, img.filename);
    await this.images.remove(img);
    await this.unlinkQuiet(filePath);
  }

  // не валимо запит, якщо файл уже відсутній
  private async unlinkQuiet(p: string): Promise<void> {
    try {
      await fs.promises.unlink(p);
    } catch {
      // ignore
    }
  }

  static fileFilter(
    _req: unknown,
    file: { mimetype: string },
    cb: (err: Error | null, accept: boolean) => void,
  ): void {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException(`mime '${file.mimetype}' not allowed`), false);
    }
  }
}
