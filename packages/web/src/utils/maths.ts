export function xz(
  ...args:
    | [x: number, y: number]
    | [coords: { x: number; y: number; z: number }]
): [number, number] {
  const [a, b] = args;

  if (typeof a === "object") {
    return [a.z, a.x];
  } else if (typeof a === "number" && typeof b === "number") {
    return [b, a];
  }

  throw new Error("Invalid input");
}

export function averageLocation(
  locations: [number, number][]
): [number, number] {
  let x = 0;
  let z = 0;
  const s = locations.length;

  for (const location of locations) {
    x += location[0];
    z += location[1];
  }

  return xz(x / s, z / s);
}
