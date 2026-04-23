interface ScoreGaugeProps {
  score: number; // 300–850
  size?: number;
  strokeWidth?: number;
}

const RISK_COLORS = [
  { min: 750, color: "#4CAF50", label: "Muito Baixo" },
  { min: 650, color: "#8BC34A", label: "Baixo" },
  { min: 550, color: "#FF9800", label: "Médio" },
  { min: 450, color: "#FF5722", label: "Alto" },
  { min: 0,   color: "#F44336", label: "Muito Alto" },
];

function getScoreColor(score: number) {
  return RISK_COLORS.find((r) => score >= r.min) ?? RISK_COLORS[4];
}

export function ScoreGauge({
  score,
  size = 140,
  strokeWidth = 10,
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Map 300–850 to 0–100%
  const pct = ((score - 300) / (850 - 300)) * 100;
  const dashOffset = circumference - (pct / 100) * circumference;
  const riskInfo = getScoreColor(score);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={riskInfo.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.5s ease" }}
        />
      </svg>
      {/* Score label (counter-rotate to appear upright) */}
      <div
        className="flex flex-col items-center mt-[-90%]"
        style={{ color: riskInfo.color }}
      >
        <span className="text-3xl font-bold tracking-tight stat-glow">
          {score}
        </span>
        <span className="text-xs font-medium opacity-80">{riskInfo.label}</span>
      </div>
    </div>
  );
}