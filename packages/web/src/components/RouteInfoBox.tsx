import { OutlinedCircle } from "./OutlinedCircle";
import { NormalCircle } from "./NormalCircle";
import { Route } from "../data";

export function RouteInfoBox(props: {
  route: Route;
  setActiveStation: (id: string) => void;
}) {
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leaflet-bar csr-info-box">
        <h2 className="csr-route-title">{props.route.name}</h2>
        <p className="csr-operator-name">Operated by: {props.route.operator}</p>

        {props.route.stations.map((station) => (
          <div
            key={station.id}
            className="csr-station-route"
            onClick={() => {
              props.setActiveStation(station.id);
            }}
          >
            {[props.route.firstStop.id, props.route.lastStop.id].includes(
              station.id
            ) ? (
              <OutlinedCircle color={props.route.color} />
            ) : (
              <NormalCircle color={props.route.color} />
            )}
            <p className="csr-route-termini">{station.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
