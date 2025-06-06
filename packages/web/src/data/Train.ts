import { xz } from "../utils/maths";
import { Route } from "./Route";
import _trains from "../../data/trains.json";

const trains: Record<`${number}`, ExtraDataInit> = _trains;

interface ExtraDataInit {
  livery?: { color: string; text?: string; stroke?: string };
  carriageOffset: number;
  trains: string[];
}

interface TrainBogie {
  dimension: string;
  location: {
    x: number;
    y: number;
    z: number;
  };
}

interface TrainCarriage {
  id: number;
  leading?: TrainBogie;
  trailing?: TrainBogie;
}

export interface TrainInit {
  id: string;
  name: string;
  owner: null;
  cars: TrainCarriage[];
  backwards: boolean;
  stopped: boolean;
}

interface TrackMapTrains {
  trains: TrainInit[];
}

export class Train {
  private static cache: Map<string, Train> = new Map();

  id: string;
  name: string;
  carriages: number;
  stopped: boolean;
  lastUpdate: number;
  livery?: number;
  location?: [number, number];
  angle?: number;
  route?: Route;

  private constructor(init: TrainInit) {
    this.id = init.id;
    this.name = init.name;
    this.carriages = init.cars.length;
    this.stopped = init.stopped;
    this.lastUpdate = Date.now();

    const cached = Train.cache.get(this.id);
    const extraData = Train.getExtraData(init.id);
    if (extraData) {
      this.carriages -= extraData.carriageOffset;
      this.livery = extraData.livery;
    }

    const { leading, trailing } = init.backwards
      ? init.cars[init.cars.length - 1]
      : init.cars[0];
    if (leading && trailing && leading.dimension === "minecraft:overworld") {
      const [head, tail] = init.backwards
        ? [trailing, leading]
        : [leading, trailing];

      this.location = xz(head.location);

      if (!init.stopped || !cached?.angle) {
        this.angle =
          (Math.atan2(
            tail.location.z - head.location.z,
            tail.location.x - head.location.x
          ) *
            180) /
            Math.PI -
          90;

        // ensure 0 >= angle > 360
        this.angle = ((this.angle % 360) + 360) % 360;
      } else {
        this.angle = cached.angle;
      }
    } else if (cached?.location) {
      this.location = cached.location;
      this.lastUpdate = cached.lastUpdate;
    }

    this.route = Route.getByTrain(this);

    Train.cache.set(this.id, this);
  }

  private static wrap(init: TrainInit): Train {
    return new Train(init);
  }

  //private static maybeWrap(init: TrainInit | undefined): Train | undefined {
  //  return init ? new Train(init) : undefined;
  //}

  private static getExtraData(id: string) {
    const result = Object.entries(trains).find(([, { trains }]) =>
      trains.includes(id)
    );

    if (result) {
      return {
        ...result[1],
        livery: parseInt(result[0]),
      };
    }

    return undefined;
  }

  static getLiveryCSS(): string {
    let css = "";

    for (const [id, init] of Object.entries(trains)) {
      css += `.csr-livery-${id} { `;

      if (init.livery) {
        css += `background: ${init.livery.color}; `;
        if (init.livery.text) css += `color: ${init.livery.text}; `;
        if (init.livery.stroke)
          css += `stroke: ${init.livery.stroke}; -webkit-text-stroke-color: ${init.livery.stroke}; `;
      }

      css += "}\n";
    }

    return css;
  }

  static async getAllLive(): Promise<Train[]> {
    const res = await fetch(
      import.meta.env.PROD
        ? "https://api.cors.lol/?url=http%3A%2F%2Fserver.mrjulsen.de%3A3876%2Fapi%2Ftrains"
        : "/api/trains"
    );
    if (!res.ok) throw res;

    const { trains }: TrackMapTrains = await res.json();

    return trains.map(this.wrap);
  }

  static getFromCache(id: string): Train | undefined {
    const results = [...this.cache.keys()].filter((k) => k.startsWith(id));
    return results.length === 1 ? this.cache.get(results[0]) : undefined;
  }
}
