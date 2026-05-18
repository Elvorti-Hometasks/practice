import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });
  try {
    const svc = app.get(SeedService);
    await svc.run();
  } finally {
    await app.close();
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('seed failed:', e);
  process.exit(1);
});
