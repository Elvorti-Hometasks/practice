import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const entitiesPath = path.join(__dirname, '..', '**', '*.entity.{ts,js}');
const migrationsPath = path.join(__dirname, 'migrations', '*.{ts,js}');

function isSqlite(cfg: { get: (k: string, d?: string) => string | undefined }): boolean {
  return (cfg.get('DB_TYPE', 'postgres') || 'postgres').toLowerCase() === 'sqlite';
}

export const typeOrmAsyncConfig = (cfg: ConfigService): TypeOrmModuleOptions => {
  if (isSqlite(cfg)) {
    const file = cfg.get<string>('SQLITE_FILE', './data/swapi.sqlite');
    return {
      type: 'better-sqlite3',
      database: path.resolve(file),
      entities: [entitiesPath],
      // для sqlite - synchronize замість міграцій
      synchronize: true,
      logging: ['error', 'warn'],
    };
  }

  return {
    type: 'postgres',
    host: cfg.get<string>('DB_HOST', 'localhost'),
    port: Number(cfg.get<string>('DB_PORT', '5432')),
    username: cfg.get<string>('DB_USER', 'swapi'),
    password: cfg.get<string>('DB_PASSWORD', 'swapi'),
    database: cfg.get<string>('DB_NAME', 'swapi'),
    entities: [entitiesPath],
    migrations: [migrationsPath],
    synchronize: false,
    logging: ['error', 'warn'],
  };
};

// для cli (migration:run, migration:generate) - тільки postgres
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'swapi',
  password: process.env.DB_PASSWORD || 'swapi',
  database: process.env.DB_NAME || 'swapi',
  entities: [entitiesPath],
  migrations: [migrationsPath],
  synchronize: false,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
