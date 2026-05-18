import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';

import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import {
  buildPagination,
  PaginatedResult,
} from './common/dto/pagination.dto';

describe('TransformInterceptor', () => {
  it('wraps a plain value into { data }', (done) => {
    const interceptor = new TransformInterceptor<{ x: number }>();
    const ctx = {} as never;
    const next = { handle: () => of({ x: 1 }) };
    interceptor.intercept(ctx, next).subscribe((res) => {
      expect(res).toEqual({ data: { x: 1 } });
      done();
    });
  });

  it("doesn't double-wrap if value already has data", (done) => {
    const interceptor = new TransformInterceptor<unknown>();
    const ctx = {} as never;
    const original = { data: { items: [1, 2, 3] } };
    const next = { handle: () => of(original as unknown) };
    interceptor.intercept(ctx, next).subscribe((res) => {
      expect(res).toBe(original);
      done();
    });
  });
});

describe('buildPagination', () => {
  it('computes pages and metadata', () => {
    const r: PaginatedResult<number> = buildPagination([1, 2, 3], 23, 2, 10);
    expect(r.total).toBe(23);
    expect(r.page).toBe(2);
    expect(r.limit).toBe(10);
    expect(r.pages).toBe(3);
    expect(r.items).toEqual([1, 2, 3]);
  });

  it('floors pages to 1 even when empty', () => {
    const r = buildPagination([], 0, 1, 10);
    expect(r.pages).toBe(1);
  });
});

describe('module wiring smoke', () => {
  it('sanity-checks that jest sees the project', async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [],
    }).compile();
    expect(mod).toBeDefined();
  });
});
