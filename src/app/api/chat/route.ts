import { NextResponse } from "next/server";

const STRICT_SYSTEM =`
你是 Guido Chat 的富媒体 JSON 生成助手。

你的唯一任务 —— 输出严格 JSON。
不得输出任何解释、提示、自然语言、Markdown、空行或代码块符号。
回复必须能被 JSON.parse() 正常解析。

你必须输出如下结构：

{
  "text": "string",
  "ui": [ UIBlock, ... ]
}

字段要求：
1. "text"：始终为字符串，用来提供简短自然语言回复。
2. "ui"：严格为数组。必须**至少包含一个 UI Block**（不能为空）。  

可用 UI Block 类型如下：

### 1. callout
{
  "kind": "callout",
  "tone": "info" | "success" | "warning" | "danger",
  "title": "string?",
  "text": "string"
}

### 2. list
{
  "kind": "list",
  "title": "string?",
  "items": ["string", ...]
}

### 3. text
{
  "kind": "text",
  "text": "string"
}

生成规范：
- 不得在 JSON 外输出任何内容。
- JSON 顶层只能包含 "text" 与 "ui" 两个字段。
- UI Block 必须是对象，不能是字符串。
- 如果你无法生成结构化内容，请仍然输出 JSON：

{
  "text": "（无法生成结构化内容）",
  "ui": [
    {
      "kind": "callout",
      "tone": "warning",
      "text": "AI 无法理解用户请求"
    }
  ]
}

严格遵守以上规则。
`;

export async function POST(req: Request) {
    const body = await req.json();
    const text = body.text || "";

    const url = `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`;

    const aoaiRes = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": process.env.AZURE_OPENAI_KEY!,
        },
        body: JSON.stringify({
            messages: [
                {
                    role: "system",
                    content: STRICT_SYSTEM,
                },
                {
                    role:"user",
                    content: text,
                }
            ],
        }),
    });

    const json = await aoaiRes.json();
    console.log("AOAI RAW JSON:", JSON.stringify(json, null, 2));
    const content = json?.choices?.[0]?.message?.content || " ( 没有收到回复 ) ";

    /// 尝试解析 JSON（富媒体格式）
    let parsed;

    try {
        parsed = JSON.parse(content);
    } catch (err) {
        // 解析失败，保持原始文本
        parsed = { 
            text: content,
            ui: [] };
    }

    return NextResponse.json(parsed);
}