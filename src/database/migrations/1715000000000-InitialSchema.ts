import { MigrationInterface, QueryRunner } from 'typeorm';

// перша міграція - всі таблиці і зв'язки
export class InitialSchema1715000000000 implements MigrationInterface {
  name = 'InitialSchema1715000000000';

  public async up(q: QueryRunner): Promise<void> {
    // planets
    await q.query(`
      CREATE TABLE "planets" (
        "id" SERIAL PRIMARY KEY,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name" varchar(255) NOT NULL,
        "rotationPeriod" varchar(64),
        "orbitalPeriod" varchar(64),
        "diameter" varchar(64),
        "climate" varchar(255),
        "gravity" varchar(255),
        "terrain" varchar(255),
        "surfaceWater" varchar(64),
        "population" varchar(64),
        "swapiUrl" varchar(255),
        CONSTRAINT "UQ_planets_swapiUrl" UNIQUE ("swapiUrl")
      )
    `);

    // films
    await q.query(`
      CREATE TABLE "films" (
        "id" SERIAL PRIMARY KEY,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "title" varchar(255) NOT NULL,
        "episodeId" int NOT NULL,
        "openingCrawl" text NOT NULL,
        "director" varchar(255) NOT NULL,
        "producer" varchar(255) NOT NULL,
        "releaseDate" date NOT NULL,
        "swapiUrl" varchar(255),
        CONSTRAINT "UQ_films_swapiUrl" UNIQUE ("swapiUrl")
      )
    `);

    // starships
    await q.query(`
      CREATE TABLE "starships" (
        "id" SERIAL PRIMARY KEY,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name" varchar(255) NOT NULL,
        "model" varchar(255),
        "manufacturer" varchar(255),
        "costInCredits" varchar(64),
        "length" varchar(64),
        "maxAtmospheringSpeed" varchar(64),
        "crew" varchar(64),
        "passengers" varchar(64),
        "cargoCapacity" varchar(64),
        "consumables" varchar(64),
        "hyperdriveRating" varchar(64),
        "MGLT" varchar(64),
        "starshipClass" varchar(255),
        "swapiUrl" varchar(255),
        CONSTRAINT "UQ_starships_swapiUrl" UNIQUE ("swapiUrl")
      )
    `);

    // vehicles
    await q.query(`
      CREATE TABLE "vehicles" (
        "id" SERIAL PRIMARY KEY,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name" varchar(255) NOT NULL,
        "model" varchar(255),
        "manufacturer" varchar(255),
        "costInCredits" varchar(64),
        "length" varchar(64),
        "maxAtmospheringSpeed" varchar(64),
        "crew" varchar(64),
        "passengers" varchar(64),
        "cargoCapacity" varchar(64),
        "consumables" varchar(64),
        "vehicleClass" varchar(255),
        "swapiUrl" varchar(255),
        CONSTRAINT "UQ_vehicles_swapiUrl" UNIQUE ("swapiUrl")
      )
    `);

    // species
    await q.query(`
      CREATE TABLE "species" (
        "id" SERIAL PRIMARY KEY,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name" varchar(255) NOT NULL,
        "classification" varchar(255),
        "designation" varchar(255),
        "averageHeight" varchar(64),
        "skinColors" varchar(255),
        "hairColors" varchar(255),
        "eyeColors" varchar(255),
        "averageLifespan" varchar(64),
        "language" varchar(128),
        "homeworld_id" int,
        "swapiUrl" varchar(255),
        CONSTRAINT "UQ_species_swapiUrl" UNIQUE ("swapiUrl"),
        CONSTRAINT "FK_species_homeworld" FOREIGN KEY ("homeworld_id")
          REFERENCES "planets"("id") ON DELETE SET NULL
      )
    `);

    // people
    await q.query(`
      CREATE TABLE "people" (
        "id" SERIAL PRIMARY KEY,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name" varchar(255) NOT NULL,
        "height" varchar(64),
        "mass" varchar(64),
        "hairColor" varchar(128),
        "skinColor" varchar(128),
        "eyeColor" varchar(128),
        "birthYear" varchar(64),
        "gender" varchar(32),
        "homeworld_id" int,
        "swapiUrl" varchar(255),
        CONSTRAINT "UQ_people_swapiUrl" UNIQUE ("swapiUrl"),
        CONSTRAINT "FK_people_homeworld" FOREIGN KEY ("homeworld_id")
          REFERENCES "planets"("id") ON DELETE SET NULL
      )
    `);

    // images
    await q.query(`
      CREATE TABLE "images" (
        "id" SERIAL PRIMARY KEY,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "slug" varchar(64) NOT NULL,
        "filename" varchar(255) NOT NULL,
        "originalName" varchar(255) NOT NULL,
        "mimeType" varchar(100) NOT NULL,
        "sizeBytes" int NOT NULL,
        "ownerType" varchar(32) NOT NULL,
        "ownerId" int NOT NULL,
        CONSTRAINT "UQ_images_slug" UNIQUE ("slug")
      )
    `);
    await q.query(
      `CREATE INDEX "IDX_images_owner" ON "images" ("ownerType", "ownerId")`,
    );

    // ===== M:M join tables =====
    await q.query(`
      CREATE TABLE "people_species" (
        "person_id" int NOT NULL,
        "species_id" int NOT NULL,
        PRIMARY KEY ("person_id", "species_id"),
        CONSTRAINT "FK_ps_person" FOREIGN KEY ("person_id")
          REFERENCES "people"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ps_species" FOREIGN KEY ("species_id")
          REFERENCES "species"("id") ON DELETE CASCADE
      )
    `);
    await q.query(
      `CREATE INDEX "IDX_ps_species" ON "people_species" ("species_id")`,
    );

    await q.query(`
      CREATE TABLE "people_starships" (
        "person_id" int NOT NULL,
        "starship_id" int NOT NULL,
        PRIMARY KEY ("person_id", "starship_id"),
        CONSTRAINT "FK_psh_person" FOREIGN KEY ("person_id")
          REFERENCES "people"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_psh_starship" FOREIGN KEY ("starship_id")
          REFERENCES "starships"("id") ON DELETE CASCADE
      )
    `);
    await q.query(
      `CREATE INDEX "IDX_psh_starship" ON "people_starships" ("starship_id")`,
    );

    await q.query(`
      CREATE TABLE "people_vehicles" (
        "person_id" int NOT NULL,
        "vehicle_id" int NOT NULL,
        PRIMARY KEY ("person_id", "vehicle_id"),
        CONSTRAINT "FK_pv_person" FOREIGN KEY ("person_id")
          REFERENCES "people"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pv_vehicle" FOREIGN KEY ("vehicle_id")
          REFERENCES "vehicles"("id") ON DELETE CASCADE
      )
    `);
    await q.query(
      `CREATE INDEX "IDX_pv_vehicle" ON "people_vehicles" ("vehicle_id")`,
    );

    await q.query(`
      CREATE TABLE "films_people" (
        "film_id" int NOT NULL,
        "person_id" int NOT NULL,
        PRIMARY KEY ("film_id", "person_id"),
        CONSTRAINT "FK_fp_film" FOREIGN KEY ("film_id")
          REFERENCES "films"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fp_person" FOREIGN KEY ("person_id")
          REFERENCES "people"("id") ON DELETE CASCADE
      )
    `);
    await q.query(`CREATE INDEX "IDX_fp_person" ON "films_people" ("person_id")`);

    await q.query(`
      CREATE TABLE "films_planets" (
        "film_id" int NOT NULL,
        "planet_id" int NOT NULL,
        PRIMARY KEY ("film_id", "planet_id"),
        CONSTRAINT "FK_fpl_film" FOREIGN KEY ("film_id")
          REFERENCES "films"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fpl_planet" FOREIGN KEY ("planet_id")
          REFERENCES "planets"("id") ON DELETE CASCADE
      )
    `);
    await q.query(`CREATE INDEX "IDX_fpl_planet" ON "films_planets" ("planet_id")`);

    await q.query(`
      CREATE TABLE "films_species" (
        "film_id" int NOT NULL,
        "species_id" int NOT NULL,
        PRIMARY KEY ("film_id", "species_id"),
        CONSTRAINT "FK_fsp_film" FOREIGN KEY ("film_id")
          REFERENCES "films"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fsp_species" FOREIGN KEY ("species_id")
          REFERENCES "species"("id") ON DELETE CASCADE
      )
    `);
    await q.query(`CREATE INDEX "IDX_fsp_species" ON "films_species" ("species_id")`);

    await q.query(`
      CREATE TABLE "films_starships" (
        "film_id" int NOT NULL,
        "starship_id" int NOT NULL,
        PRIMARY KEY ("film_id", "starship_id"),
        CONSTRAINT "FK_fst_film" FOREIGN KEY ("film_id")
          REFERENCES "films"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fst_starship" FOREIGN KEY ("starship_id")
          REFERENCES "starships"("id") ON DELETE CASCADE
      )
    `);
    await q.query(
      `CREATE INDEX "IDX_fst_starship" ON "films_starships" ("starship_id")`,
    );

    await q.query(`
      CREATE TABLE "films_vehicles" (
        "film_id" int NOT NULL,
        "vehicle_id" int NOT NULL,
        PRIMARY KEY ("film_id", "vehicle_id"),
        CONSTRAINT "FK_fv_film" FOREIGN KEY ("film_id")
          REFERENCES "films"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fv_vehicle" FOREIGN KEY ("vehicle_id")
          REFERENCES "vehicles"("id") ON DELETE CASCADE
      )
    `);
    await q.query(
      `CREATE INDEX "IDX_fv_vehicle" ON "films_vehicles" ("vehicle_id")`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    // у зворотньому порядку, інакше FK не дадуть видалити
    await q.query(`DROP TABLE IF EXISTS "films_vehicles"`);
    await q.query(`DROP TABLE IF EXISTS "films_starships"`);
    await q.query(`DROP TABLE IF EXISTS "films_species"`);
    await q.query(`DROP TABLE IF EXISTS "films_planets"`);
    await q.query(`DROP TABLE IF EXISTS "films_people"`);
    await q.query(`DROP TABLE IF EXISTS "people_vehicles"`);
    await q.query(`DROP TABLE IF EXISTS "people_starships"`);
    await q.query(`DROP TABLE IF EXISTS "people_species"`);
    await q.query(`DROP TABLE IF EXISTS "images"`);
    await q.query(`DROP TABLE IF EXISTS "people"`);
    await q.query(`DROP TABLE IF EXISTS "species"`);
    await q.query(`DROP TABLE IF EXISTS "vehicles"`);
    await q.query(`DROP TABLE IF EXISTS "starships"`);
    await q.query(`DROP TABLE IF EXISTS "films"`);
    await q.query(`DROP TABLE IF EXISTS "planets"`);
  }
}
