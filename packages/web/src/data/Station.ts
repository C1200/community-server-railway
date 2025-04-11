import { stations } from "community-server-railway-data";
import { StationGroup } from "community-server-railway-data/types";
import { averageLocation } from "../utils/maths";
import slug from "../utils/slug";

export type StationInit = StationGroup;

export class Station {
  name: string;
  location: [number, number];

  private constructor(init: StationInit) {
    this.name = init.name;
    this.location = averageLocation(init.location);
  }

  private static wrap(init: StationInit): Station {
    return new Station(init);
  }

  private static maybeWrap(init: StationInit | undefined): Station | undefined {
    return init ? new Station(init) : undefined;
  }

  private static getId(init: Station | StationInit): string {
    return slug(init.name);
  }

  static getAll(): Station[] {
    return stations.map(this.wrap);
  }

  static getById(id: string) {
    return this.maybeWrap(
      stations.find((station) => this.getId(station) === id)
    );
  }

  static getByName(name: string): Station | undefined {
    return this.maybeWrap(stations.find((station) => station.name === name));
  }

  get id() {
    return Station.getId(this);
  }
}
