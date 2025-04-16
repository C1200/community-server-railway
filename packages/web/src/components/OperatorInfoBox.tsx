import { OutlinedCircle } from "./OutlinedCircle";
import { Route } from "../data";
import { Link } from "../utils/useLocation";
import { useMemo } from "react";

export function OperatorInfoBox(props: { operator: string }) {
  const routes = useMemo(
    () => Route.getByOperator(props.operator),
    [props.operator]
  );

  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leaflet-bar csr-info-box">
        <h2 className="csr-station-name">
          {routes[0]?.operator || props.operator}
        </h2>

        {routes.map((route) => (
          <p key={route.id} className="csr-station-route">
            <Link href={`/route/${route.id}`}>
              <OutlinedCircle color={route.color} />
              <p className="csr-route-name">{route.name}</p>
              <p className="csr-route-termini">
                {route.firstStop.name} - {route.lastStop.name}
              </p>
            </Link>
          </p>
        ))}
      </div>
    </div>
  );
}
