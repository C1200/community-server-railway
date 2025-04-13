import { useCallback, useEffect, useState } from "react";
import * as L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  Tooltip,
} from "react-leaflet";
import Train from "./data/Train";
import { Route } from "./data/Route";
import { Station } from "./data/Station";
import useLocation, { Link } from "./utils/useLocation";
import useSWR from "swr";

interface Colors {
  background: string;
  station: string;
}

function OutlinedCircle(props: { color: string }) {
  return (
    <svg className="csr-route-circle" viewBox="0 0 10 10">
      <circle
        cx={5}
        cy={5}
        r={4}
        stroke={props.color}
        strokeWidth={2}
        fill="transparent"
      />
    </svg>
  );
}

function NormalCircle(props: { color: string }) {
  return (
    <svg className="csr-route-circle" viewBox="0 0 10 10">
      <circle cx={5} cy={5} r={3} fill={props.color} />
    </svg>
  );
}

function SecondsCounter(props: { time: number | Date }) {
  const [text, setText] = useState("");

  const time = props.time instanceof Date ? props.time.getTime() : props.time;

  const update = useCallback(() => {
    const f = new Intl.RelativeTimeFormat();
    const relative = Math.floor((time - Date.now()) / 1000);
    setText(f.format(relative, "seconds"));
  }, [time]);

  useEffect(() => {
    update();
    const interval = setInterval(update, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [update]);

  return text;
}

function StationMarker(props: {
  station: Station;
  colors: Colors;
  dim?: boolean;
  showTooltip?: boolean;
  onClick?: () => void;
}) {
  return (
    <CircleMarker
      key={props.station.name}
      center={props.station.location}
      radius={6}
      pathOptions={{
        color: props.colors.station,
        fillColor: props.colors.background,
        fillOpacity: 1,
        opacity: props.dim ? 0.2 : 1,
      }}
      eventHandlers={{
        click() {
          props.onClick?.();
        },
      }}
    >
      <Tooltip className="csr-name-tooltip" permanent={props.showTooltip}>
        {props.station.name}
      </Tooltip>
    </CircleMarker>
  );
}

function RouteLine(props: { route: Route; color: string }) {
  return (
    <Polyline
      positions={props.route.stations.map((station) => station.location)}
      pathOptions={{
        color: props.color,
      }}
    />
  );
}

function TrainMarker(props: { train: Train }) {
  if (!props.train.location || !props.train.angle || !props.train.route)
    return null;

  const icon = document.createElement("svg");
  let angle = props.train.angle;

  icon.classList.add("csr-livery");
  if (angle < 180) {
    icon.classList.add("csr-flip-livery");
    angle -= 90;
  }else{
    angle -= 270
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
          <Link href={`/route/${props.train.route.id}`}>
            {props.train.route.name}
          </Link>
        </p>
        <p>
          <Link href={`/route/${props.train.route.id}`}>
            {props.train.name}
          </Link>
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

function StationInfoBox(props: {
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

function RouteInfoBox(props: {
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

export default function App(props: {
  center: [number, number];
  colors?: Partial<Colors>;
}) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [location, setLocation] = useLocation();
  const { data: trains } = useSWR("trains", () => Train.getAllLive(), {
    refreshInterval: 15000,
    revalidateOnFocus: false,
    onError(err) {
      console.error(err);
    },
  });
  const pathParts = location.pathname.substring(1).split("/");

  const activeRoute =
    pathParts[0] === "route" ? `${pathParts[1]}/${pathParts[2]}` : undefined;
  function setActiveRoute(id: string) {
    setLocation(`/route/${id}`);
  }

  const activeStation = pathParts[0] === "station" ? pathParts[1] : undefined;
  function setActiveStation(id: string) {
    setLocation(`/station/${id}`);
  }

  const colors: Colors = {
    background: props.colors?.background ?? "#fff",
    station: props.colors?.station ?? "#000",
  };

  const resolvedActiveRoute = activeRoute
    ? Route.getById(activeRoute)
    : undefined;
  const resolvedActiveStation = activeStation
    ? Station.getById(activeStation)
    : undefined;

  useEffect(() => {
    if (resolvedActiveRoute)
      map?.fitBounds(
        L.polyline(
          resolvedActiveRoute.stations.map((station) => station.location)
        ).getBounds(),
        { padding: [50, 50] }
      );
  }, [map, resolvedActiveRoute]);

  useEffect(() => {
    if (resolvedActiveStation) map?.flyTo(resolvedActiveStation.location);
  }, [map, resolvedActiveStation]);

  return (
    <MapContainer
      ref={(map) => {
        setMap(map);
      }}
      center={props.center}
      zoom={0}
      minZoom={-4}
      maxZoom={0}
      zoomSnap={0}
      crs={L.Util.extend(L.CRS.Simple, {
        transformation: new L.Transformation(1, 0, 1, 0),
      })}
      style={{
        background: colors.background,
      }}
    >
      <style>{Train.getLiveryCSS()}</style>

      {Route.getAll().map((route) => (
        <RouteLine key={route.id} route={route} color="#eee" />
      ))}

      {Station.getAll().map((station) => (
        <StationMarker
          key={station.id}
          station={station}
          colors={colors}
          dim={activeStation ? activeStation !== station.id : !!activeRoute}
          onClick={() => {
            setActiveStation(station.id);
          }}
        />
      ))}

      {trains
        ?.filter(
          (train) =>
            train.route &&
            (!resolvedActiveRoute || train.route.id === resolvedActiveRoute.id)
        )
        .map((train) => (
          <TrainMarker key={train.id} train={train} />
        ))}

      {resolvedActiveStation && (
        <StationInfoBox
          station={resolvedActiveStation}
          setActiveRoute={setActiveRoute}
        />
      )}

      {resolvedActiveRoute && (
        <>
          <RouteInfoBox
            route={resolvedActiveRoute}
            setActiveStation={setActiveStation}
          />

          <RouteLine
            route={resolvedActiveRoute}
            color={resolvedActiveRoute.color}
          />

          {resolvedActiveRoute.stations.map((station) => (
            <StationMarker
              key={station.id}
              station={station}
              showTooltip
              colors={{
                ...colors,
                station: resolvedActiveRoute.color,
              }}
              onClick={() => {
                setActiveStation(station.id);
              }}
            />
          ))}
        </>
      )}
    </MapContainer>
  );
}
