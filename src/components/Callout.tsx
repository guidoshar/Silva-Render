"use client";

interface CalloutProps {
  title?: string;
  text: string;
  tone?: "info" | "success" | "warning" | "danger";
}

export default function Callout({ title, text, tone = "info" }: CalloutProps) {
  const toneColors = {
    info: { border: "#bfdbfe", background: "#eff6ff" },
    success: { border: "#4ade80", background: "#f0fdf4" },
    warning: { border: "#facc15", background: "#fefce8" },
    danger: { border: "#fca5a5", background: "#fef2f2" },
  };

  const c = toneColors[tone];

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        border: `1px solid ${c.border}`,
        background: c.background,
        whiteSpace: "pre-wrap",
      }}
    >
      {title && <div style={{ fontWeight: 700 }}>{title}</div>}
      <div style={{ marginTop: title ? 6 : 0 }}>{text}</div>
    </div>
  );
}
