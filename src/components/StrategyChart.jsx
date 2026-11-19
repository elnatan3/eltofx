import { useId } from "react";

const OHLC = [
  [270, 252, 245, 282],
  [252, 240, 232, 261],
  [240, 255, 232, 269],
  [255, 224, 219, 265],
  [224, 211, 203, 233],
  [211, 228, 199, 239],
  [228, 242, 218, 253],
  [242, 232, 224, 251],
  [232, 200, 194, 246],
  [200, 180, 175, 212],
  [180, 198, 168, 208],
  [198, 211, 187, 221],
  [211, 234, 203, 245],
  [234, 260, 227, 269],
  [260, 284, 251, 295],
  [284, 271, 264, 296],
  [271, 248, 241, 279],
  [248, 218, 211, 255],
  [218, 199, 192, 228],
  [199, 206, 189, 216],
  [206, 173, 167, 214],
  [173, 148, 138, 183],
  [148, 161, 135, 173],
  [161, 122, 115, 171],
  [122, 102, 96, 132],
  [102, 116, 94, 129],
  [116, 83, 76, 124],
  [83, 66, 56, 93],
];

export default function StrategyChart({ side = "buy", stage = 2 }) {
  const uid = useId().replace(/:/g, "");
  const sell = side === "sell";
  const y = (value) => (sell ? 390 - value : value);
  const entry = y(259);
  const stop = y(323);
  const targets = [y(195), y(131), y(67)];
  const labels = sell
    ? ["3,993.00", "3,986.00", "3,979.00"]
    : ["4,007.00", "4,014.00", "4,021.00"];
  return (
    <svg
      className="strategy-chart"
      viewBox="0 0 760 380"
      role="img"
      aria-label={`Illustrative ${sell ? "supply sell" : "demand buy"} setup: entry 4,000, stop 7 points away, and targets 7, 14, and 21 points away. Not live market data.`}
    >
      <defs>
        <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#caff80" stopOpacity=".11" />
          <stop offset="1" stopColor="#caff80" stopOpacity=".01" />
        </linearGradient>
      </defs>
      {[67, 131, 195, 259, 323].map((v) => (
        <line
          key={v}
          x1="36"
          x2="710"
          y1={v}
          y2={v}
          className="chart-gridline"
        />
      ))}
      {[80, 180, 280, 380, 480, 580, 680].map((v) => (
        <line
          key={v}
          x1={v}
          x2={v}
          y1="36"
          y2="333"
          className="chart-gridline"
        />
      ))}
      <rect
        x="325"
        y={Math.min(y(263), y(298))}
        width="235"
        height="35"
        rx="2"
        className={`order-zone ${stage >= 1 ? "visible" : ""}`}
      />
      {stage >= 1 && (
        <text x="335" y={sell ? 112 : 291} className="zone-label">
          {sell ? "SUPPLY ZONE" : "DEMAND ZONE"}
        </text>
      )}
      {stage >= 2 && (
        <>
          <rect
            x="411"
            y={Math.min(entry, targets[2])}
            width="178"
            height={Math.abs(entry - targets[2])}
            fill={`url(#fill-${uid})`}
          />
          <rect
            x="411"
            y={Math.min(entry, stop)}
            width="178"
            height={Math.abs(entry - stop)}
            fill="#df8172"
            fillOpacity=".06"
          />
          <line
            x1="407"
            x2="672"
            y1={entry}
            y2={entry}
            stroke="#dddccf"
            strokeDasharray="4 5"
            strokeOpacity=".65"
          />
          <line
            x1="407"
            x2="672"
            y1={stop}
            y2={stop}
            stroke="#df8172"
            strokeDasharray="4 5"
            strokeOpacity=".6"
          />
          <rect
            x="603"
            y={stop - 10}
            width="84"
            height="20"
            rx="3"
            fill="#35201e"
          />
          <text x="612" y={stop + 4} className="stop-label">
            SL · 7 pts
          </text>
          <circle
            cx="411"
            cy={entry}
            r="5"
            fill="#d4ff96"
            stroke="#141812"
            strokeWidth="3"
          />
          <text x="609" y={entry - 8} className="entry-label">
            4,000.00
          </text>
        </>
      )}
      {stage >= 3 &&
        targets.map((target, i) => (
          <g
            key={target}
            className="target-line"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <line
              x1="445"
              x2="672"
              y1={target}
              y2={target}
              stroke="#bfe986"
              strokeOpacity=".5"
              strokeDasharray="3 5"
            />
            <rect
              x="601"
              y={target - 12}
              width="87"
              height="24"
              rx="4"
              fill="#25321c"
            />
            <text x="612" y={target + 4} className="target-label">
              TP{i + 1} · {(i + 1) * 7} pts
            </text>
            <text
              x="699"
              y={target + 4}
              textAnchor="end"
              className="chart-price"
              opacity="0"
            >
              {labels[i]}
            </text>
          </g>
        ))}
      {OHLC.map(([open, close, high, low], i) => {
        const up = close < open;
        const x = 47 + i * 20;
        const color = (sell ? !up : up) ? "#b9c7a2" : "#595d54";
        return (
          <g key={i} opacity={i > 14 && stage < 2 ? 0.15 : 1}>
            <line
              x1={x}
              x2={x}
              y1={y(high)}
              y2={y(low)}
              stroke={color}
              strokeWidth="1.1"
            />
            <rect
              x={x - 5.5}
              y={Math.min(y(open), y(close))}
              width="11"
              height={Math.max(3, Math.abs(open - close))}
              rx="1"
              fill={color}
            />
          </g>
        );
      })}
      <path
        d={sell ? "M68 86 L229 162" : "M68 263 L229 187"}
        stroke="#b9c7a2"
        strokeWidth="1.5"
        strokeDasharray="3 5"
        fill="none"
        opacity=".7"
      />
      <text x="70" y={sell ? 68 : 302} className="chart-annotation">
        {sell ? "HTF bearish structure" : "HTF bullish structure"}
      </text>
      <text x="45" y="363" className="chart-axis">
        09:30
      </text>
      <text x="245" y="363" className="chart-axis">
        09:45
      </text>
      <text x="445" y="363" className="chart-axis">
        10:00
      </text>
      <text x="646" y="363" className="chart-axis">
        10:15 ET
      </text>
    </svg>
  );
}
