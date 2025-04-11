export function xz(x: number, z: number): [number, number] {
  return [z, x];
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
