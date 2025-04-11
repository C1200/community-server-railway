import { PluginConfig, StationGroup, TrackMapNetwork } from "../types.js";

export default async function gatherStations(config: PluginConfig) {
  const res = await fetch(new URL("/api/network", config.trackmap));
  const network: TrackMapNetwork = await res.json();
  if (!res.ok) throw res;

  const resolved: Map<string, StationGroup> = new Map();

  for (const station of network.stations) {
    if (station.dimension !== "minecraft:overworld") continue;

    const group = config.stations.find((group) =>
      group.includes.includes(station.name)
    );

    if (group) {
      const rGroup = resolved.get(group.name) || { ...group, location: [] };
      rGroup.location.push([station.location.x, station.location.z]);
      resolved.set(group.name, rGroup);
    } else if (!config.filterUngrouped) {
      resolved.set(`Ungrouped__${station.name}`, {
        name: station.name,
        includes: [station.name],
        location: [[station.location.x, station.location.z]],
      });
    }
  }

  return [...resolved.values()];
}
