# SWAPI backend (Nest + TypeORM)

CRUD-бекенд навколо даних зі swapi. 6 сутностей (people, planets, films,
species, starships, vehicles), завантаження картинок, Swagger UI.

## Що потрібно

- Node 18+
- Postgres через Docker - опціонально (працює і на SQLite)

## Швидкий старт (SQLite, без докера)

```bash
cp .env.example .env
npm install
npm run seed
npm run start
```

Сервер: `http://localhost:3000`. Swagger: `http://localhost:3000/api`.

## Запуск на Postgres

У `.env` виставити `DB_TYPE=postgres`, далі:

```bash
docker compose up -d
npm install
npm run migration:run
npm run seed
npm run start
```

## ENV

| Змінна | За замовчуванням | Що це |
| --- | --- | --- |
| `PORT` | 3000 | порт сервера |
| `DB_TYPE` | sqlite | `sqlite` або `postgres` |
| `SQLITE_FILE` | ./data/swapi.sqlite | файл бази для sqlite |
| `DB_HOST` | localhost | postgres |
| `DB_PORT` | 5432 | postgres |
| `DB_USER` | swapi | postgres |
| `DB_PASSWORD` | swapi | postgres |
| `DB_NAME` | swapi | postgres |
| `SWAPI_BASE_URL` | https://swapi.py4e.com/api | джерело даних для сідера |
| `UPLOAD_DIR` | ./uploads | куди класти файли |
| `MAX_UPLOAD_SIZE_MB` | 5 | максимальний розмір одного файлу |

## Структура

```
src/
  common/       pagination, interceptor, filter, base entity
  database/     data-source + міграції (postgres)
  people/       модуль персонажів (entity, dto, repo, service, controller)
  planets/
  films/
  species/
  starships/
  vehicles/
  images/       завантаження і роздача картинок
  seed/         наповнення БД зі swapi
```

## CRUD

Для кожної сутності (приклад на people):

- `GET /people?page=1&limit=10` - пагінована сторінка, сортовано від останнього
- `GET /people/:id` - одна сутність з усіма зв'язками
- `POST /people` - створити
- `PATCH /people/:id` - оновити (часткове, всі поля опціональні)
- `DELETE /people/:id` - видалити

Інші ресурси: `/planets`, `/films`, `/species`, `/starships`, `/vehicles`.

Всі відповіді обгортаються у `{ data: ... }` глобальним інтерцептором.

## Картинки

```
POST   /entities/:type/:id/images   # multipart/form-data, поле files=[file...]
GET    /entities/:type/:id/images   # список метаданих
GET    /images/:slug/raw            # сам файл (унікальний slug)
DELETE /images/:id                  # знести
```

`:type` - один з `person|planet|film|species|starship|vehicle`.

Дозволені mime: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
Розмір - до `MAX_UPLOAD_SIZE_MB` мегабайт. Файли лежать у `./uploads` під
випадковими іменами, безпосереднього хостингу як статики немає - лише через
`/images/:slug/raw`.

## Міграції (postgres)

```
npm run migration:run         # накатати
npm run migration:revert      # відкатати останню
npm run migration:gen         # згенерити нову з різниці entities ↔ БД
```

У sqlite-режимі схема будується через `synchronize: true`.

## Тести

```
npm test               # unit тести (без БД)
npm run test:e2e       # інтеграційний smoke, потребує піднятої БД
```

## Зв'язки

- `Person → Planet (homeworld)` - M:1
- `Species → Planet (homeworld)` - M:1
- `Person ↔ Species` - M:M (`people_species`), володіюча сторона - Person
- `Person ↔ Starship/Vehicle` - M:M, володіюча - Person
- `Film ↔ Person/Planet/Species/Starship/Vehicle` - M:M, володіюча - Film

Володіюча сторона - та, в якій декларовано `@JoinTable`. Зв'язки редагуються
з боку, що володіє (наприклад фільми персонажа - через `PATCH /films/:id`
з `charactersIds`).
