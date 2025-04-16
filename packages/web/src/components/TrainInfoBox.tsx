import { Train } from "../data";
import { Link } from "../utils/useLocation";
import slug from "../utils/slug";
import { OutlinedCircle } from "./OutlinedCircle";

export function TrainInfoBox(props: { train: Train }) {
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leaflet-bar csr-info-box">
        <h2 className="csr-route-title">
          {props.train.name} ({props.train.id.substring(0, 8)})
        </h2>
        <p className="csr-operator-name">
          Owned by:{" "}
          {props.train.route ? (
            <Link href={`/operator/${slug(props.train.route.operator)}`}>
              {props.train.route.operator}
            </Link>
          ) : (
            "Unknown"
          )}
        </p>

        {props.train.route && (
          <p className="csr-station-route">
            <Link href={`/route/${props.train.route.id}`}>
              <OutlinedCircle color={props.train.route.color} />
              <p className="csr-route-name">{props.train.route.name}</p>
              <p className="csr-route-termini">
                {props.train.route.firstStop.name} -{" "}
                {props.train.route.lastStop.name}
              </p>
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
