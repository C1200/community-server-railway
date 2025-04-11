import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function useLocation(): [
  string,
  Dispatch<SetStateAction<string>>
] {
  const [path, setPath] = useState(location.pathname);

  useEffect(() => {
    history.pushState({}, "", path);
  }, [path]);

  return [path, setPath];
}
