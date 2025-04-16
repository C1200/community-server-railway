import { CircleMarker, Tooltip } from "react-leaflet";
import { Colors } from "../App";
import { Station } from "../data";
import useLocation from "../utils/useLocation";

export function StationMarker(props: {
  station: Station;
  colors: Colors;
  dim?: boolean;
  showTooltip?: boolean;
}) {
  const [, setLocation] = useLocation();

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
          setLocation(`/station/${props.station.id}`);
        },
      }}
    >
      <Tooltip className="csr-name-tooltip" permanent={props.showTooltip}>
        {props.station.name}
      </Tooltip>
    </CircleMarker>
  );
}
