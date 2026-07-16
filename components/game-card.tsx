"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Game } from "@/lib/games";

export default function GameCard({ game }: { game: Game }) {
  const tiltRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-6px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg)`;
  };

  const onLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = "";
  };

  const btnClass =
    "btn " +
    (game.color === "magenta" ? "magenta" : game.color === "yellow" ? "yellow" : "");

  return (
    <div ref={tiltRef} className="card" onMouseMove={onMove} onMouseLeave={onLeave}>
      <Link href={`/juegos/${game.id}`}>
        <div className="cover">
          <div className={"cover-bg " + game.cover}></div>
          <div className="label">{game.cat}</div>
        </div>
      </Link>
      <div className="meta">
        <div className="title">
          <Link href={`/juegos/${game.id}`}>{game.title}</Link>
        </div>
        <div className="desc">{game.short}</div>
        <div className="row">
          <div className="score-badge">
            <span>MEJOR PUNTUACIÓN</span>
            <b>{game.best.toLocaleString("es-ES")}</b>
          </div>
          <Link className={btnClass} href={`/juegos/${game.id}`}>
            JUGAR
          </Link>
        </div>
      </div>
    </div>
  );
}
