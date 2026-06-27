type Series = { label: string; color: string; values: number[] };

export function RadarChart({
  axes,
  series,
  max = 5,
  size = 260,
}: {
  axes: string[];
  series: Series[];
  max?: number;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 36;
  const n = axes.length;

  const point = (i: number, v: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const dist = (v / max) * r;
    return [cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist] as const;
  };

  const grid = [1, 2, 3, 4, 5].slice(0, max).map((step) => {
    const pts = axes.map((_, i) => point(i, step)).map(([x, y]) => `${x},${y}`).join(" ");
    return <polygon key={step} points={pts} className="fill-none stroke-border" strokeWidth={1} />;
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-sm">
      {grid}
      {axes.map((_, i) => {
        const [x, y] = point(i, max);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="stroke-border" strokeWidth={1} />;
      })}
      {series.map((s, si) => {
        const pts = s.values.map((v, i) => point(i, v)).map(([x, y]) => `${x},${y}`).join(" ");
        return (
          <g key={si}>
            <polygon points={pts} fill={s.color} fillOpacity={0.2} stroke={s.color} strokeWidth={2} />
            {s.values.map((v, i) => {
              const [x, y] = point(i, v);
              return <circle key={i} cx={x} cy={y} r={3} fill={s.color} />;
            })}
          </g>
        );
      })}
      {axes.map((a, i) => {
        const [x, y] = point(i, max + 0.6);
        return (
          <text key={a} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[10px]">
            {a}
          </text>
        );
      })}
    </svg>
  );
}
