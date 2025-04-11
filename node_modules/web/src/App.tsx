import { useEffect, useState } from "react";
import * as L from "leaflet";
import { CircleMarker, MapContainer, Polyline, Tooltip } from "react-leaflet";
import { Route } from "./data/Route";
import { Station } from "./data/Station";
import useLocation from "./utils/useLocation";

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
  const [path, setPath] = useLocation();
  const pathParts = path.substring(1).split("/");

  const activeRoute =
    pathParts[0] === "route" ? `${pathParts[1]}/${pathParts[2]}` : undefined;
  function setActiveRoute(id: string) {
    setPath(`/route/${id}`);
  }

  const activeStation = pathParts[0] === "station" ? pathParts[1] : undefined;
  function setActiveStation(id: string) {
    setPath(`/station/${id}`);
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
