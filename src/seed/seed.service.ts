import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SwapiClient } from './swapi.client';
import {
  SwapiFilm,
  SwapiPerson,
  SwapiPlanet,
  SwapiSpecies,
  SwapiStarship,
  SwapiVehicle,
} from './swapi.types';
import { Person } from '../people/person.entity';
import { Planet } from '../planets/planet.entity';
import { Film } from '../films/film.entity';
import { Species } from '../species/species.entity';
import { Starship } from '../starships/starship.entity';
import { Vehicle } from '../vehicles/vehicle.entity';

@Injectable()
export class SeedService {
  private readonly log = new Logger('Seed');

  constructor(
    private readonly swapi: SwapiClient,
    @InjectRepository(Person) private readonly people: Repository<Person>,
    @InjectRepository(Planet) private readonly planets: Repository<Planet>,
    @InjectRepository(Film) private readonly films: Repository<Film>,
    @InjectRepository(Species) private readonly species: Repository<Species>,
    @InjectRepository(Starship)
    private readonly starships: Repository<Starship>,
    @InjectRepository(Vehicle)
    private readonly vehicles: Repository<Vehicle>,
  ) {}

  async run(): Promise<void> {
    this.log.log('starting seed');

    // 1. тягнемо все паралельно
    const [
      planetsRaw,
      filmsRaw,
      starshipsRaw,
      vehiclesRaw,
      speciesRaw,
      peopleRaw,
    ] = await Promise.all([
      this.swapi.fetchAll<SwapiPlanet>('planets'),
      this.swapi.fetchAll<SwapiFilm>('films'),
      this.swapi.fetchAll<SwapiStarship>('starships'),
      this.swapi.fetchAll<SwapiVehicle>('vehicles'),
      this.swapi.fetchAll<SwapiSpecies>('species'),
      this.swapi.fetchAll<SwapiPerson>('people'),
    ]);

    // 2. зберігаємо скалярні поля (без зв'язків). порядок: незалежні спочатку
    const planetByUrl = await this.upsertPlanets(planetsRaw);
    const filmByUrl = await this.upsertFilms(filmsRaw);
    const starshipByUrl = await this.upsertStarships(starshipsRaw);
    const vehicleByUrl = await this.upsertVehicles(vehiclesRaw);
    const speciesByUrl = await this.upsertSpecies(speciesRaw, planetByUrl);
    const personByUrl = await this.upsertPeople(peopleRaw, planetByUrl);

    // 3. зв'язки. володіюча сторона - Film і Person
    await this.linkPeople(peopleRaw, personByUrl, {
      speciesByUrl,
      starshipByUrl,
      vehicleByUrl,
    });

    await this.linkFilms(filmsRaw, filmByUrl, {
      personByUrl,
      planetByUrl,
      speciesByUrl,
      starshipByUrl,
      vehicleByUrl,
    });

    this.log.log('seed done');
  }

  // ---- upsert helpers ----

  private async upsertPlanets(
    items: SwapiPlanet[],
  ): Promise<Map<string, Planet>> {
    const map = new Map<string, Planet>();
    for (const p of items) {
      const existing = await this.planets.findOne({ where: { swapiUrl: p.url } });
      const entity = existing ?? this.planets.create({ swapiUrl: p.url });
      entity.name = p.name;
      entity.rotationPeriod = nullable(p.rotation_period);
      entity.orbitalPeriod = nullable(p.orbital_period);
      entity.diameter = nullable(p.diameter);
      entity.climate = nullable(p.climate);
      entity.gravity = nullable(p.gravity);
      entity.terrain = nullable(p.terrain);
      entity.surfaceWater = nullable(p.surface_water);
      entity.population = nullable(p.population);
      await this.planets.save(entity);
      map.set(p.url, entity);
    }
    return map;
  }

  private async upsertFilms(items: SwapiFilm[]): Promise<Map<string, Film>> {
    const map = new Map<string, Film>();
    for (const f of items) {
      const existing = await this.films.findOne({ where: { swapiUrl: f.url } });
      const entity = existing ?? this.films.create({ swapiUrl: f.url });
      entity.title = f.title;
      entity.episodeId = f.episode_id;
      entity.openingCrawl = f.opening_crawl;
      entity.director = f.director;
      entity.producer = f.producer;
      entity.releaseDate = f.release_date;
      await this.films.save(entity);
      map.set(f.url, entity);
    }
    return map;
  }

  private async upsertStarships(
    items: SwapiStarship[],
  ): Promise<Map<string, Starship>> {
    const map = new Map<string, Starship>();
    for (const s of items) {
      const existing = await this.starships.findOne({
        where: { swapiUrl: s.url },
      });
      const entity = existing ?? this.starships.create({ swapiUrl: s.url });
      entity.name = s.name;
      entity.model = nullable(s.model);
      entity.manufacturer = nullable(s.manufacturer);
      entity.costInCredits = nullable(s.cost_in_credits);
      entity.length = nullable(s.length);
      entity.maxAtmospheringSpeed = nullable(s.max_atmosphering_speed);
      entity.crew = nullable(s.crew);
      entity.passengers = nullable(s.passengers);
      entity.cargoCapacity = nullable(s.cargo_capacity);
      entity.consumables = nullable(s.consumables);
      entity.hyperdriveRating = nullable(s.hyperdrive_rating);
      entity.MGLT = nullable(s.MGLT);
      entity.starshipClass = nullable(s.starship_class);
      await this.starships.save(entity);
      map.set(s.url, entity);
    }
    return map;
  }

  private async upsertVehicles(
    items: SwapiVehicle[],
  ): Promise<Map<string, Vehicle>> {
    const map = new Map<string, Vehicle>();
    for (const v of items) {
      const existing = await this.vehicles.findOne({
        where: { swapiUrl: v.url },
      });
      const entity = existing ?? this.vehicles.create({ swapiUrl: v.url });
      entity.name = v.name;
      entity.model = nullable(v.model);
      entity.manufacturer = nullable(v.manufacturer);
      entity.costInCredits = nullable(v.cost_in_credits);
      entity.length = nullable(v.length);
      entity.maxAtmospheringSpeed = nullable(v.max_atmosphering_speed);
      entity.crew = nullable(v.crew);
      entity.passengers = nullable(v.passengers);
      entity.cargoCapacity = nullable(v.cargo_capacity);
      entity.consumables = nullable(v.consumables);
      entity.vehicleClass = nullable(v.vehicle_class);
      await this.vehicles.save(entity);
      map.set(v.url, entity);
    }
    return map;
  }

  private async upsertSpecies(
    items: SwapiSpecies[],
    planetByUrl: Map<string, Planet>,
  ): Promise<Map<string, Species>> {
    const map = new Map<string, Species>();
    for (const s of items) {
      const existing = await this.species.findOne({
        where: { swapiUrl: s.url },
      });
      const entity = existing ?? this.species.create({ swapiUrl: s.url });
      entity.name = s.name;
      entity.classification = nullable(s.classification);
      entity.designation = nullable(s.designation);
      entity.averageHeight = nullable(s.average_height);
      entity.skinColors = nullable(s.skin_colors);
      entity.hairColors = nullable(s.hair_colors);
      entity.eyeColors = nullable(s.eye_colors);
      entity.averageLifespan = nullable(s.average_lifespan);
      entity.language = nullable(s.language);
      entity.homeworld = s.homeworld ? planetByUrl.get(s.homeworld) ?? null : null;
      await this.species.save(entity);
      map.set(s.url, entity);
    }
    return map;
  }

  private async upsertPeople(
    items: SwapiPerson[],
    planetByUrl: Map<string, Planet>,
  ): Promise<Map<string, Person>> {
    const map = new Map<string, Person>();
    for (const p of items) {
      const existing = await this.people.findOne({
        where: { swapiUrl: p.url },
      });
      const entity = existing ?? this.people.create({ swapiUrl: p.url });
      entity.name = p.name;
      entity.height = nullable(p.height);
      entity.mass = nullable(p.mass);
      entity.hairColor = nullable(p.hair_color);
      entity.skinColor = nullable(p.skin_color);
      entity.eyeColor = nullable(p.eye_color);
      entity.birthYear = nullable(p.birth_year);
      entity.gender = nullable(p.gender);
      entity.homeworld = p.homeworld ? planetByUrl.get(p.homeworld) ?? null : null;
      await this.people.save(entity);
      map.set(p.url, entity);
    }
    return map;
  }

  // ---- relation linking ----

  private async linkPeople(
    raw: SwapiPerson[],
    personByUrl: Map<string, Person>,
    maps: {
      speciesByUrl: Map<string, Species>;
      starshipByUrl: Map<string, Starship>;
      vehicleByUrl: Map<string, Vehicle>;
    },
  ): Promise<void> {
    for (const r of raw) {
      const person = personByUrl.get(r.url);
      if (!person) continue;
      person.species = r.species
        .map((u) => maps.speciesByUrl.get(u))
        .filter((x): x is Species => !!x);
      person.starships = r.starships
        .map((u) => maps.starshipByUrl.get(u))
        .filter((x): x is Starship => !!x);
      person.vehicles = r.vehicles
        .map((u) => maps.vehicleByUrl.get(u))
        .filter((x): x is Vehicle => !!x);
      await this.people.save(person);
    }
  }

  private async linkFilms(
    raw: SwapiFilm[],
    filmByUrl: Map<string, Film>,
    maps: {
      personByUrl: Map<string, Person>;
      planetByUrl: Map<string, Planet>;
      speciesByUrl: Map<string, Species>;
      starshipByUrl: Map<string, Starship>;
      vehicleByUrl: Map<string, Vehicle>;
    },
  ): Promise<void> {
    for (const r of raw) {
      const film = filmByUrl.get(r.url);
      if (!film) continue;
      film.characters = r.characters
        .map((u) => maps.personByUrl.get(u))
        .filter((x): x is Person => !!x);
      film.planets = r.planets
        .map((u) => maps.planetByUrl.get(u))
        .filter((x): x is Planet => !!x);
      film.species = r.species
        .map((u) => maps.speciesByUrl.get(u))
        .filter((x): x is Species => !!x);
      film.starships = r.starships
        .map((u) => maps.starshipByUrl.get(u))
        .filter((x): x is Starship => !!x);
      film.vehicles = r.vehicles
        .map((u) => maps.vehicleByUrl.get(u))
        .filter((x): x is Vehicle => !!x);
      await this.films.save(film);
    }
  }
}

// swapi іноді віддає "n/a", "unknown", "" - переводимо в null щоб не засмічувати
function nullable(v: string | null | undefined): string | null {
  if (v === null || v === undefined) return null;
  const t = v.trim();
  if (t === '' || t.toLowerCase() === 'n/a' || t.toLowerCase() === 'unknown') {
    return null;
  }
  return t;
}
