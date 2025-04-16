export function OutlinedCircle(props: { color: string }) {
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
