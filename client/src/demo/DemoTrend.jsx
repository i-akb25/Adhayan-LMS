export default function DemoTrend({ attendance = false }) {
  const values = attendance
    ? [88, 91, 90, 93, 94, 95]
    : [42, 48, 55, 61, 67, 76];
  const points = values
    .map((value, index) => `${30 + index * 64},${170 - value * 1.4}`)
    .join(" ");
  return (
    <figure className="w-full min-w-0">
      <svg
        viewBox="0 0 390 200"
        role="img"
        aria-label={
          attendance
            ? "Illustrative attendance rises from 88 to 95 percent over six weeks"
            : "Illustrative practice accuracy rises from 42 to 76 percent over six weeks"
        }
        className="w-full h-48"
      >
        <path d="M25 20V175H365" fill="none" stroke="#94a3b8" />
        <polyline
          points={points}
          fill="none"
          stroke="#6366f1"
          strokeWidth="3"
        />
        {values.map((value, index) => (
          <g key={index}>
            <circle
              cx={30 + index * 64}
              cy={170 - value * 1.4}
              r="4"
              fill="#6366f1"
            />
            <text
              x={30 + index * 64}
              y={158 - value * 1.4}
              fontSize="11"
              textAnchor="middle"
              fill="#64748b"
            >
              {value}%
            </text>
            <text
              x={30 + index * 64}
              y={191}
              fontSize="10"
              textAnchor="middle"
              fill="#64748b"
            >
              W{index + 1}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="text-xs text-slate-500">
        Illustrative demonstration data. Real reports use saved learning
        records.
      </figcaption>
    </figure>
  );
}
