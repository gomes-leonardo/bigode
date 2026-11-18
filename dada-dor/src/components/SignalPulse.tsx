import { getLength, getPointAtLength } from "@remotion/paths";
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { H, W } from "../theme";

// Ponto de luz que percorre um path SVG (do braço até a cabeça) e "acende" ao chegar.
export const SignalPulse: React.FC<{ path: string; durationFrames: number; inicio?: number; cor: string }> = ({ path, durationFrames, inicio = 0, cor }) => {
  const f = useCurrentFrame();
  const total = getLength(path);
  const t = interpolate(f, [inicio, inicio + durationFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (f < inicio) return null;
  const rastro = [0, 0.04, 0.08, 0.12];
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <path d={path} stroke={cor} strokeWidth={6} fill="none" opacity={0.25} strokeLinecap="round" />
      {rastro.map((d, i) => {
        const p = getPointAtLength(path, Math.max(0, t - d) * total) ?? { x: 0, y: 0 };
        return <circle key={i} cx={p.x} cy={p.y} r={16 - i * 3} fill={cor} opacity={(1 - i * 0.22) * (t >= 1 ? interpolate(f, [inicio + durationFrames, inicio + durationFrames + 6], [1, 0], { extrapolateRight: "clamp" }) : 1)} style={{ filter: `drop-shadow(0 0 12px ${cor})` }} />;
      })}
      {t >= 1 && (() => {
        const p = getPointAtLength(path, total) ?? { x: 0, y: 0 };
        const r = interpolate(f, [inicio + durationFrames, inicio + durationFrames + 14], [10, 90], { extrapolateRight: "clamp" });
        return <circle cx={p.x} cy={p.y} r={r} fill="none" stroke={cor} strokeWidth={6} opacity={interpolate(r, [10, 90], [1, 0])} />;
      })()}
    </svg>
  );
};

