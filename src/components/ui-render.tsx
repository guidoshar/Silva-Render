"use client";

import Callout from "@/components/Callout";

type UICallout = {
  kind: "callout";
  tone?: "info" | "success" | "warning" | "danger";
  title?: string;
  text: string;
};

type UIText = {
  kind: "text";
  text: string;
};

type UIList = {
  kind: "list";
  title?: string;
  items: string[];
};

type UIBlock = UICallout | UIText | UIList;

export function renderUIBlock(block: UIBlock, key: number) {
  switch (block.kind) {
    case "callout":
      return (
        <Callout
          key={key}
          title={block.title}
          text={block.text}
          tone={block.tone}
        />
      );

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
