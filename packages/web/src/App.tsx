import * as L from "leaflet";
import useSWR from "swr";
import { LayerGroup, LayersControl, MapContainer } from "react-leaflet";
import { useEffect, useState } from "react";
import { Route, Station, Train } from "./data";
import useLocation from "./utils/useLocation";
import {
  RouteInfoBox,
  StationInfoBox,
  TrainMarker,
  RouteLine,
  StationMarker,
} from "./components";

export interface Colors {
  background: string;
  station: string;
}

export default function App(props: {
  center: [number, number];
  colors?: Partial<Colors>;
}) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [location, setLocation] = useLocation();
  const { data: trains } = useSWR("trains", () => Train.getAllLive(), {
    refreshInterval: 15000,
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
      <LayersControl position="topright">
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

        <LayersControl.Overlay name="Trains" checked>
          <LayerGroup>
            {trains
              ?.filter(
                (train) =>
                  train.route &&
                  (!resolvedActiveRoute ||
                    train.route.id === resolvedActiveRoute.id)
              )
              .map((train) => (
                <TrainMarker key={train.id} train={train} />
              ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Untracked Trains">
          <LayerGroup>
            {trains
              ?.filter((train) => !train.route)
              .map((train) => (
                <TrainMarker key={train.id} train={train} />
              ))}
          </LayerGroup>
        </LayersControl.Overlay>

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
      </LayersControl>
    </MapContainer>
  );
}
