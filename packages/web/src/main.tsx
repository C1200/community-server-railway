import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { xz } from "./utils/maths.ts";
import "leaflet/dist/leaflet.css";
import "./index.css";
import { LocationProvider } from "./utils/useLocation.tsx";

createRoot(document.getElementById("root")!).render(
  <LocationProvider>
    <App center={xz(2102, -937)} />
  </LocationProvider>
);
