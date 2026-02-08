interface SafetyBadgeProps {
  score: number;
  size?: "small" | "medium" | "large";
}

export default function SafetyBadge({ score, size = "medium" }: SafetyBadgeProps) {
  const getColor = (score: number) => {
    if (score >= 8) return {
      text: "text-[#10b981]",
      bg: "bg-[#10b981]/10",
      border: "border-[#10b981]/30"
    };
    if (score >= 6) return {
      text: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/30"
    };
    return {
      text: "text-[#FF0080]",
      bg: "bg-[#FF0080]/10",
      border: "border-[#FF0080]/30"
    };
  };

  const getLabel = (score: number) => {
    if (score >= 8) return "SAFE";
    if (score >= 6) return "MEDIUM";
    return "DANGER";
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "px-2 py-1 text-xs";
      case "large":
        return "px-4 py-2 text-lg";
      default:
        return "px-3 py-1.5 text-sm";
    }
  };

  const colors = getColor(score);

  return (
    <div className={`${colors.bg} ${colors.text} ${colors.border} border rounded-full font-bold inline-flex items-center gap-1 ${getSizeClasses()}`}>
      <span>{score.toFixed(1)}</span>
      {size !== "small" && <span className="opacity-70">• {getLabel(score)}</span>}
    </div>
  );
}
