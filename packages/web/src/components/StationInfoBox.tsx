import { OutlinedCircle } from "./OutlinedCircle";
import { Route, Station } from "../data";

export function StationInfoBox(props: {
  station: Station;
  setActiveRoute: (id: string) => void;
}) {
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leaflet-bar csr-info-box">
        <h2 className="csr-station-name">{props.station.name}</h2>

        {Route.getByStation(props.station).map((route) => (
          <div
            key={route.id}
            className="csr-station-route"
            onClick={() => {
              props.setActiveRoute(route.id);
            }}
          >
            <OutlinedCircle color={route.color} />
            <p className="csr-route-name">{route.name}</p>
            <p className="csr-route-termini">
              {route.firstStop.name} - {route.lastStop.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
