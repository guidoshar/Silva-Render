"use client";

import { useState } from "react";

export default function Page() {
  const [input, setInput] = useState("");
  const [resp, setResp] = useState<any>(null);

  async function send() {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input }),
    });
    const data = await res.json();

    console.log("data from /api/chat:", data);

    setResp(data);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Guido Chat</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (input.trim()) {
              send();
            }
          }
        }}
        placeholder="对我随便说一句话"
        rows={3}
        style={{
          padding: 8,
          width: 400,
          resize: "none",
        }}
      />

      <button onClick={send} style={{ marginLeft: 8 }}>
        来吧快发送！
      </button>

      <pre style={{ marginTop: 24, whiteSpace: "pre-wrap" }}>
        {resp?.text ?? ""}
      </pre>

      {/* 富媒体UI渲染，从这里开始 */}
      {resp?.ui?.map((block: any, idx: number) => {
        if (block.kind !== "callout") return null;
        const toneColors = {
            info: {
                border: "#bfdbfe",
                background: "eff6ff",
            },
            success: {
                border: "86efac",
                background: "#476959ff",
            },
            warning: {
                border: "#facc15",
                background: "#fef2f2",
            },
            danger: {
                border: "#fca5a5",
                background: "#fef2f2",
            },
        }
        return (
          <div
            key={idx}
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              border: `1px solid ${
                toneColors[block.tone]?.border ?? "#bfdbfe"
              }`,
              background: toneColors[block.tone]?.background ?? "#eff6ff",
            }}
          >
            {block.title ? (
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                {block.title}
              </div>
            ) : null}

            <div style={{ whiteSpace: "pre-wrap" }}>{block.text}</div>
          </div>
        );
      })}
    </main>
  );
}
