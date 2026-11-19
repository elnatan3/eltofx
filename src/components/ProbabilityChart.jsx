import { useId, useState } from "react";
import { compactMoney, money } from "../lib/finance.js";

export default function ProbabilityChart({ fan, initial }) {
  const uid = useId().replace(/:/g, "");
  const [hover, setHover] = useState(null);
  const [log, setLog] = useState(false);
  const selected = fan[Math.min(hover ?? fan.length - 1, fan.length - 1)];
  const w = 800,
    h = 330;
  const box = { left: 80, top: 22, right: 778, bottom: 283 };
  const transform = (value) =>
    log ? Math.log10(Math.max(1e-12, value)) : value;
  const allValues = fan.flatMap((row) => [
    transform(row.low),
    transform(row.high),
  ]);
  let bottom = log ? Math.min(...allValues) - 0.08 : 0;
  let top = Math.max(...allValues);
  if (top <= bottom) top = bottom + 1;
  top += (top - bottom) * 0.13;
  const y = (value) =>
    box.bottom -
    ((transform(value) - bottom) / (top - bottom)) * (box.bottom - box.top);
  const x = (index) =>
    box.left + (index / (fan.length - 1)) * (box.right - box.left);
  const path = (key, rows = fan) =>
    rows
      .map(
        (row, i) =>
          `${i ? "L" : "M"}${x(row.trade).toFixed(1)},${y(row[key]).toFixed(1)}`,
      )
      .join(" ");
  const area = `${path("high")} ${[...fan]
    .reverse()
    .map((row) => `L${x(row.trade).toFixed(1)},${y(row.low).toFixed(1)}`)
    .join(" ")} Z`;
  const ticks = Array.from(
    { length: 5 },
    (_, i) => bottom + ((top - bottom) * i) / 4,
  );
  return (
    <div className="probability-chart-wrap">
      <div className="chart-legend">
        <div>
          <span>
            <i className="legend-band" />
            10th–90th percentile
          </span>
          <span>
            <i className="legend-line" />
            Median balance
          </span>
        </div>
        <label className="log-toggle">
          <input
            type="checkbox"
            checked={log}
            onChange={(e) => setLog(e.target.checked)}
          />
          Log scale
        </label>
      </div>
      <div className="chart-inspection">
        <span>TRADE {selected.trade}</span>
        <strong>{money(selected.median)}</strong>
        <span>
          median · {compactMoney(selected.low)}–{compactMoney(selected.high)}{" "}
          central range
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="probability-chart"
        role="img"
        aria-label={`Exact binomial balance projection over ${fan.length - 1} trades. Final median ${money(fan.at(-1).median)}. The shaded area shows the 10th to 90th percentiles at each trade, not a guaranteed path.`}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const mouseX = ((event.clientX - rect.left) / rect.width) * w;
          setHover(
            Math.max(
              0,
              Math.min(
                fan.length - 1,
                Math.round(
                  ((mouseX - box.left) / (box.right - box.left)) *
                    (fan.length - 1),
                ),
              ),
            ),
          );
        }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`fan-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#caff80" stopOpacity=".2" />
            <stop offset="1" stopColor="#caff80" stopOpacity=".02" />
          </linearGradient>
        </defs>
        {ticks.map((tick, i) => {
          const ordinate = box.bottom - (i / 4) * (box.bottom - box.top);
          return (
            <g key={i}>
              <line
                x1={box.left}
                x2={box.right}
                y1={ordinate}
                y2={ordinate}
                className="chart-gridline"
              />
              <text
                x={box.left - 15}
                y={ordinate + 4}
                textAnchor="end"
                className="chart-axis"
              >
                {compactMoney(log ? 10 ** tick : tick)}
              </text>
            </g>
          );
        })}
        <line
          x1={box.left}
          x2={box.right}
          y1={y(initial)}
          y2={y(initial)}
          stroke="#686c5d"
          strokeDasharray="4 5"
        />
        <path d={area} fill={`url(#fan-${uid})`} />
        <path
          d={path("high")}
          stroke="#bfe986"
          strokeWidth="1"
          strokeOpacity=".25"
          fill="none"
        />
        <path
          d={path("low")}
          stroke="#bfe986"
          strokeWidth="1"
          strokeOpacity=".25"
          fill="none"
        />
        <path
          d={path("median")}
          stroke="#d3fa9e"
          strokeWidth="2.5"
          fill="none"
          strokeLinejoin="round"
        />
        <line
          x1={x(selected.trade)}
          x2={x(selected.trade)}
          y1={box.top}
          y2={box.bottom}
          stroke="#d9e2cd"
          strokeOpacity=".2"
          strokeDasharray="3 4"
        />
        <circle
          cx={x(selected.trade)}
          cy={y(selected.median)}
          r="4"
          fill="#d3fa9e"
          stroke="#141812"
          strokeWidth="2"
        />
        {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => (
          <text
            key={i}
            x={box.left + fraction * (box.right - box.left)}
            y="313"
            textAnchor="middle"
            className="chart-axis"
          >
            {Math.round((fan.length - 1) * fraction)}
          </text>
        ))}
        <text x="778" y="328" textAnchor="end" className="chart-axis">
          TRADES
        </text>
      </svg>
      <label className="chart-scrubber">
        <span className="microcopy">Inspect a trade</span>
        <input
          type="range"
          min="0"
          max={fan.length - 1}
          value={Math.min(hover ?? fan.length - 1, fan.length - 1)}
          onChange={(e) => setHover(Number(e.target.value))}
          aria-label="Inspect trade number in balance projection"
        />
      </label>
    </div>
  );
}
