import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

// інтеграційний smoke. потребує запущеної БД (або postgres+migration:run, або sqlite).
describe('AppModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /people відповідає 200 і має { data }', async () => {
    const res = await request(app.getHttpServer()).get('/people').expect(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('items');
  });

  it('POST /people з некоректним тілом => 400', async () => {
    await request(app.getHttpServer())
      .post('/people')
      .send({ height: 'tall' /* нема name */ })
      .expect(400);
  });
});
