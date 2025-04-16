import { OutlinedCircle } from "./OutlinedCircle";
import { NormalCircle } from "./NormalCircle";
import { Route } from "../data";
import { Link } from "../utils/useLocation";
import slug from "../utils/slug";

export function RouteInfoBox(props: { route: Route }) {
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leaflet-bar csr-info-box">
        <h2 className="csr-route-title">{props.route.name}</h2>
        <p className="csr-operator-name">
          Operated by:{" "}
          <Link href={`/operator/${slug(props.route.operator)}`}>
            {props.route.operator}
          </Link>
        </p>

        {props.route.stations.map((station) => (
          <p key={station.id} className="csr-station-route">
            <Link href={`/station/${station.id}`}>
              {[props.route.firstStop.id, props.route.lastStop.id].includes(
                station.id
              ) ? (
                <OutlinedCircle color={props.route.color} />
              ) : (
                <NormalCircle color={props.route.color} />
              )}
              <span className="csr-route-termini">{station.name}</span>
            </Link>
          </p>
        ))}
      </div>
    </div>
  );
}
