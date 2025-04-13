import {
  createContext,
  JSX,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type ContextValue = [URL, (next: string | URL) => void];

const ctx = createContext<ContextValue>([
  new URL(location.href),
  (next) => {
    location.href = next instanceof URL ? next.href : next;
  },
]);

export function LocationProvider(props: { children?: ReactNode }) {
  const [location, setLocation] = useState(window.location.href);

  useEffect(() => {
    history.pushState({}, "", location);
  }, [location]);

  return (
    <ctx.Provider
      {...props}
      value={[
        new URL(location),
        (next) => {
          setLocation((prev) => new URL(next, prev).href);
        },
      ]}
    />
  );
}

export function Link(props: JSX.IntrinsicElements["a"]) {
  const [, setLocation] = useLocation();

  return (
    <a
      {...props}
      onClick={(ev) => {
        ev.preventDefault();
        if (props.href) setLocation(props.href);
      }}
    />
  );
}

export default function useLocation() {
  return useContext(ctx);
}
