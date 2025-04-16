import * as L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { SecondsCounter } from "./SecondsCounter";
import { Train } from "../data";
import { Link } from "../utils/useLocation";

export function TrainMarker(props: { train: Train }) {
  if (!props.train.location || props.train.angle === undefined) return null;

  const icon = document.createElement("svg");
  let angle = props.train.angle;

  icon.classList.add("csr-livery");
  if (angle < 180) {
    icon.classList.add("csr-flip-livery");
    angle -= 90;
  } else {
    angle -= 270;
  }
  if (props.train.livery) {
    icon.classList.add("csr-livery-" + props.train.livery);
  }

  icon.setAttribute("width", "24");
  icon.setAttribute("height", "16");
  icon.style.rotate = `${angle}deg`;
  icon.innerHTML = `<text x="12" y="12">${
    props.train.route?.short || ""
  }</text>`;

  return (
    <Marker
      position={props.train.location}
      icon={L.divIcon({
        className: "csr-train-marker",
        iconSize: [24, 24],
        html: icon,
      })}
    >
      <Popup offset={[0, -5]} closeButton={false}>
        <p>
          {props.train.route ? (
            <Link href={`/route/${props.train.route.id}`}>
              {props.train.route.name}
            </Link>
          ) : (
            "Unknown Route"
          )}
        </p>
        <p>
          {props.train.route ? (
            <Link href={`/route/${props.train.route.id}`}>
              {props.train.name}
            </Link>
          ) : (
            props.train.name
          )}
        </p>
        <p>{props.train.carriages} carriages</p>
        <p>
          <SecondsCounter time={props.train.lastUpdate} />
        </p>
        {props.train.stopped && <p>Stopped</p>}
      </Popup>
    </Marker>
  );
}
