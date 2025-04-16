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
  TrainInfoBox,
} from "./components";
import { OperatorInfoBox } from "./components/OperatorInfoBox";

export interface Colors {
  background: string;
  station: string;
}

export default function App(props: {
  center: [number, number];
  colors?: Partial<Colors>;
}) {
  const [map, setMap] = useState<L.Map | null>(null);
  const { data: trains } = useSWR("trains", () => Train.getAllLive(), {
    refreshInterval: 15000,
    onError(err) {
      console.error(err);
    },
  });

  const [location, setLocation] = useLocation();
  const pathParts = location.pathname.substring(1).split("/");

  const activeRoute =
    pathParts[0] === "route" ? `${pathParts[1]}/${pathParts[2]}` : undefined;
  const activeStation = pathParts[0] === "station" ? pathParts[1] : undefined;
  const activeTrain = pathParts[0] === "train" ? pathParts[1] : undefined;
  const activeOperator = pathParts[0] === "operator" ? pathParts[1] : undefined;

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
  const resolvedActiveTrain = activeTrain
    ? Train.getFromCache(activeTrain)
    : undefined;

  useEffect(() => {
    if (map && resolvedActiveRoute)
      map.fitBounds(
        L.polyline(
          resolvedActiveRoute.stations.map((station) => station.location)
        ).getBounds(),
        { padding: [50, 50] }
      );
  }, [map, resolvedActiveRoute]);

  useEffect(() => {
    if (map && resolvedActiveStation) map.flyTo(resolvedActiveStation.location);
  }, [map, resolvedActiveStation]);

  useEffect(() => {
    if (
      activeTrain &&
      resolvedActiveTrain &&
      activeTrain !== resolvedActiveTrain.id
    )
      return setLocation(`/train/${resolvedActiveTrain.id}`);

    if (map && resolvedActiveTrain?.location)
      map.flyTo(resolvedActiveTrain.location);
  }, [map, activeTrain, resolvedActiveTrain, setLocation]);

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
          />
        ))}

        <LayersControl.Overlay name="Trains" checked>
          <LayerGroup>
            {trains
              ?.filter(
                (train) =>
                  train.route &&
                  (!resolvedActiveRoute ||
                    train.route.id === resolvedActiveRoute.id) &&
                  (!resolvedActiveTrain || train.id === resolvedActiveTrain.id)
              )
              .map((train) => (
                <TrainMarker key={train.id} train={train} />
              ))}
          </LayerGroup>
        </LayersControl.Overlay>

        <LayersControl.Overlay name="Untracked Trains">
          <LayerGroup>
            {trains
              ?.filter(
                (train) =>
                  !train.route &&
                  (!resolvedActiveTrain || train.id === resolvedActiveTrain.id)
              )
              .map((train) => (
                <TrainMarker key={train.id} train={train} />
              ))}
          </LayerGroup>
        </LayersControl.Overlay>

        {resolvedActiveStation && (
          <StationInfoBox station={resolvedActiveStation} />
        )}

        {resolvedActiveRoute && (
          <>
            <RouteInfoBox route={resolvedActiveRoute} />

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
              />
            ))}
          </>
        )}

        {resolvedActiveTrain && <TrainInfoBox train={resolvedActiveTrain} />}
        {activeOperator && <OperatorInfoBox operator={activeOperator} />}
      </LayersControl>
    </MapContainer>
  );
}
