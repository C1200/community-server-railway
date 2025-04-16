import { Polyline } from "react-leaflet";
import { Route } from "../data";

export function RouteLine(props: { route: Route; color: string }) {
  return (
    <Polyline
      positions={props.route.stations.map((station) => station.location)}
      pathOptions={{
        color: props.color,
      }}
    />
  );
}
