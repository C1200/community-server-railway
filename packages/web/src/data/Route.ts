import slug from "../utils/slug";
import { Station } from "./Station";
import routes from "../../data/routes.json";

export type RouteInit = (typeof routes)[number];

export class Route {
  name: string;
  operator: string;
  color: string;
  stations: Station[];

  private constructor(init: RouteInit) {
    this.name = init.name;
    this.operator = init.operator;
    this.color = init.color;
    this.stations = init.stations.map((stationName) => {
      const station = Station.getByName(stationName);
      if (!station) throw new Error(`Unknown station: ${stationName}`);
      return station;
    });
  }

  private static wrap(init: RouteInit): Route {
    return new Route(init);
  }

  private static maybeWrap(init: RouteInit | undefined): Route | undefined {
    return init ? new Route(init) : undefined;
  }

  private static getId(init: Route | RouteInit): string {
    return `${slug(init.operator)}/${slug(init.name)}`;
  }

  static getAll(): Route[] {
    return routes.map(this.wrap);
  }

  static getById(id: string): Route | undefined {
    return this.maybeWrap(routes.find((route) => this.getId(route) === id));
  }

  static getByStation(station: Station): Route[] {
    return routes
      .filter((route) => route.stations.includes(station.name))
      .map(this.wrap);
  }

  get id() {
    return Route.getId(this);
  }

  get firstStop() {
    return this.stations[0];
  }

  get lastStop() {
    return this.stations[this.stations.length - 1];
  }
}
