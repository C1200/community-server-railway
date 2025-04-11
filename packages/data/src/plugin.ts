import { Plugin } from "vite";
import { PluginConfig } from "./types.js";
import gatherStations from "./stations/gatherStations.js";

export default function data(config: PluginConfig): Plugin {
  config.filterUngrouped = config.filterUngrouped ?? false;

  return {
    name: "data",
    enforce: "pre",
    resolveId(source) {
      if (source === "community-server-railway-data") {
        return "community-server-railway-data";
      }
    },
    async load(id) {
      if (id === "community-server-railway-data") {
        const stations = await gatherStations(config);
        return `export const stations = ${JSON.stringify(stations)}`;
      }
    },
  };
}
