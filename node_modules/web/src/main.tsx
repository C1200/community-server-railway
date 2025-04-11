import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { xz } from "./utils/maths.ts";
import "leaflet/dist/leaflet.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App center={xz(2102, -937)} />
  </StrictMode>
);
