import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import data from "@community-server-railway/data/plugin";

import stations from "./data/stations.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    data({
      trackmap: "http://server.mrjulsen.de:3876",
      filterUngrouped: true,
      stations,
    }),
  ],
});
