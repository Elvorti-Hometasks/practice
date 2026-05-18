import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SwapiListResponse } from './swapi.types';

@Injectable()
export class SwapiClient {
  private readonly log = new Logger('SwapiClient');
  private readonly base: string;

  constructor(cfg: ConfigService) {
    this.base = cfg.get<string>('SWAPI_BASE_URL', 'https://swapi.dev/api');
  }

  async fetchAll<T>(resource: string): Promise<T[]> {
    const items: T[] = [];
    let url: string | null = `${this.base}/${resource}/`;
    let pages = 0;
    while (url) {
      const page: SwapiListResponse<T> = await this.getJson<SwapiListResponse<T>>(url);
      items.push(...page.results);
      url = page.next;
      pages++;
      // мінімальна затримка, щоб не довбати
      await sleep(50);
    }
    this.log.log(`fetched ${items.length} ${resource} from ${pages} pages`);
    return items;
  }

  // ретраїмо кілька разів - swapi іноді тупо лежить пару секунд
  private async getJson<T>(url: string, attempt = 1): Promise<T> {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return (await res.json()) as T;
    } catch (e) {
      if (attempt >= 4) throw e;
      const wait = 500 * attempt;
      this.log.warn(
        `fetch ${url} failed (${(e as Error).message}), retry in ${wait}ms`,
      );
      await sleep(wait);
      return this.getJson<T>(url, attempt + 1);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
