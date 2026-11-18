import { AbsoluteFill } from "remotion";
import { Character, Pose } from "./components/Character";
import { COR } from "./theme";

// Folha de teste: poses e elenco desenhados em código.
const POSES: Pose[] = ["neutral", "walking", "sitting", "armsUp", "back", "holding", "kneeling", "fallen"];
export const TesteDada: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(${COR.fundo}, ${COR.fundo2})` }}>
    {POSES.map((p, i) => (
      <Character key={p} asset="dada" pose={p} x={130 + i * 230} y={500} scale={0.85} arcs={p === "armsUp" ? "calm" : "neutral"} />
    ))}
    <Character asset="mae" pose="holding" x={200} y={1000} scale={0.8} arcs="worried" />
    <Character asset="medica" pose="clipboard" x={520} y={1000} scale={0.8} arcs="calm" />
    <div style={{ position: "absolute", left: 700, top: 0, opacity: 0.25 }}>
      <Character asset="figurante" pose="neutral" x={140} y={1000} scale={0.8} arcs="none" />
    </div>
    <Character asset="senhor" pose="neutral" x={1100} y={1000} scale={0.8} arcs="calm" />
    <Character asset="dada" pose="riding" x={1400} y={1000} scale={0.8} arcs="curious" />
    <Character asset="dada-adulta" pose="bikeBack" x={1720} y={1000} scale={0.8} arcs="neutral" />
  </AbsoluteFill>
);
