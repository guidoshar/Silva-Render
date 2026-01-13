"use client";

import Callout from "@/components/Callout";
import { UIBlock } from "@/types/ui-block";

export function renderUIBlock(block: UIBlock, key: number) {
  switch (block.kind) {

    // --- 1. Callout ---
    case "callout":
      return (
        <Callout
          key={key}
          title={block.title}
          text={block.text}
          tone={block.tone}
        />
      );

    // --- 2. Text ---
    case "text":
      return (
        <div
          key={key}
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.1)",
            background: "rgba(255,255,255,0.55)",
            whiteSpace: "pre-wrap",
          }}
        >
          {block.text}
        </div>
      );

    // --- 3. List ---
    case "list":
      return (
        <div
          key={key}
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.1)",
            background: "rgba(255,255,255,0.55)",
          }}
        >
          {block.title && (
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              {block.title}
            </div>
          )}

          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {block.items.map((it, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {it}
              </li>
            ))}
          </ul>
        </div>
      );

    // --- 4. Audio（NEW）---
    case "audio":
      return (
        <div
          key={key}
          style={{
            marginTop: 12,
            padding: 16,
            borderRadius: 16,
            border: "1px solid rgba(150,150,150,0.25)",
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* 说明文字 */}
          {block.caption && (
            <div
              style={{
                marginBottom: 8,
                fontSize: 14,
                color: "#333",
              }}
            >
              {block.caption}
            </div>
          )}

          {/* 音频已生成 */}
          {block.url ? (
            <audio
              controls
              style={{ width: "100%" }}
              src={block.url}
            />
          ) : (
            // 音频生成中
            <div style={{ fontStyle: "italic", color: "#888" }}>
              语音生成中…
            </div>
          )}
        </div>
      );

    // --- 5. 默认兜底 ---
    default:
      return (
        <div
          key={key}
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            background: "rgba(255,240,240,0.6)",
            border: "1px dashed #e99",
            fontSize: 12,
            whiteSpace: "pre-wrap",
          }}
        >
          ⚠️ 未识别的 UI Block：
          {JSON.stringify(block, null, 2)}
        </div>
      );
  }
}
