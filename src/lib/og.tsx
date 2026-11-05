import type * as React from "react";

export const OG_SIZE = { width: 1200, height: 630 } as const;

const BG = "#16171c";
const FG = "#efeee9";
const MUTED = "#a3a6b3";
const ACCENT = "#8fb4e6";

/** Shared Open Graph layout rendered by next/og. Only flexbox and a CSS subset are supported here. */
export function OgCard({
  eyebrow,
  title,
  description,
  footer,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  footer: string;
}): React.ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: `linear-gradient(135deg, ${BG} 0%, #1f2230 100%)`,
        color: FG,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: ACCENT,
            color: BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          MU
        </div>
        <div style={{ fontSize: 24, color: MUTED, letterSpacing: 4, textTransform: "uppercase" }}>
          {eyebrow}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontSize: title.length > 70 ? 48 : 60,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -1.5,
          }}
        >
          {title}
        </div>
        {description ? (
          <div style={{ fontSize: 28, color: MUTED, lineHeight: 1.35 }}>{description}</div>
        ) : null}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: MUTED }}>
        <span>{footer}</span>
        <span style={{ color: ACCENT }}>UI · Backend · Full-stack</span>
      </div>
    </div>
  );
}

/** Monogram used for favicons and app icons. */
export function MonogramIcon({ size }: { size: number }): React.ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#3d6fb0",
        color: "#ffffff",
        borderRadius: Math.round(size * 0.22),
        fontSize: Math.round(size * 0.46),
        fontWeight: 700,
        letterSpacing: -1,
        fontFamily: "sans-serif",
      }}
    >
      MU
    </div>
  );
}
