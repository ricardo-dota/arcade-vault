import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fade-in" style={{ textAlign: "center", padding: "120px 24px" }}>
      <div
        className="pixel neon-magenta flicker"
        style={{ fontSize: 32, marginBottom: 20 }}
      >
        GAME OVER
      </div>
      <div
        className="pixel neon-cyan"
        style={{ fontSize: 14, marginBottom: 16, letterSpacing: "0.18em" }}
      >
        ERROR 404
      </div>
      <p
        className="mono"
        style={{
          color: "var(--ink-dim)",
          letterSpacing: "0.1em",
          marginBottom: 32,
        }}
      >
        Esta máquina no existe en el salón. <span className="blink">_</span>
      </p>
      <Link className="btn lg" href="/">
        VOLVER AL VAULT
      </Link>
    </div>
  );
}
