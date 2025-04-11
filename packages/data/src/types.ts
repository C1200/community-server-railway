export interface PluginConfig {
  trackmap: string;
  stations: StationGroupConfig[];
  filterUngrouped?: boolean;
}

export interface StationGroupConfig {
  name: string;
  includes: string[];
}

export interface StationGroup extends StationGroupConfig {
  location: [number, number][];
}

export interface TrackMapNetwork {
  tracks: any;
  portals: any;
  stations: {
    id: string;
    name: string;
    dimension: string;
    location: { x: number; y: number; z: number };
    angle: number;
    assembling: boolean;
  }[];
}
