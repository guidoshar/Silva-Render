# 🌿 Silva-Render
**A plug-and-play rich-media rendering engine for AI agents.  
轻量、可插拔、可扩展的 AI 富媒体渲染引擎。**

Silva-Render 让你的 AI 应用能够直接渲染结构化的富媒体内容（UI Blocks），  
从纯文本对话提升到图文混排、信息块、列表、卡片、未来甚至图表、图片、音频、可视化组件。

它是构建 **AI-Native UI** 的基础设施。

---

## ✨ Features

### ✅ **Structured Rich-Media Blocks**
Silva-Render 提供统一的 UI Block 协议，AI 只需输出 JSON，即可渲染内容：

- **Text Block**  
- **Callout Block**（支持 info / success / warning / danger）
- **List Block**  
- （未来：Image / Chart / Audio / Table / Markdown / Custom 组件）

### ✅ **Plug-and-Play（可插拔渲染引擎）**
只需一个 `renderUIBlock()`，即可根据 JSON 自动选择组件渲染  
无需写复杂的前端逻辑。

### ✅ **Elegant Glassmorphism UI**
内置漂亮的对话气泡（玻璃拟态），舒适的排版，用户体验卓越。

### ✅ **Graceful Degradation（优雅降级）**
若 AI 输出格式错误，自动降级为普通文本，保证不会崩。

### ✅ **Future-Proof（未来可扩展）**
该项目的目标是成为 AI 应用的「前端渲染层标准」。

---

## 🧩 Supported UI Blocks

### **1. Text Block**
```json
{
  "kind": "text",
  "text": "Some paragraph or formatted explanation."
}
2. Callout Block
json
复制代码
{
  "kind": "callout",
  "tone": "info",
  "title": "提示",
  "text": "用于强调重要信息。"
}
3. List Block
json
复制代码
{
  "kind": "list",
  "title": "步骤如下",
  "items": ["步骤 A", "步骤 B", "步骤 C"]
}
🔨 How It Works
AI 输出结构化 JSON：

json
复制代码
{
  "text": "你好，我可以帮你做很多事情。",
  "ui": [
    {
      "kind": "callout",
      "tone": "success",
      "title": "欢迎使用 Silva-Render",
      "text": "这是一个结构化渲染引擎示例。"
    },
    {
      "kind": "list",
      "title": "我能做什么",
      "items": [
        "展示结构化信息",
        "支持富媒体内容",
        "为你的 AI 应用提供更好的 UI 框架"
      ]
    }
  ]
}
前端接收到后：

tsx
复制代码
{msg.ui?.map((block, i) => renderUIBlock(block, i))}
渲染为美观的富媒体卡片。

📦 Project Structure
bash
复制代码
src/
 ├─ app/
 │   ├─ api/chat/route.ts   # LLM 返回 JSON 的后端接口
 │   ├─ page.tsx            # 主聊天页
 │   └─ globals.css         # 全局动画/样式
 ├─ components/
 │   ├─ ChatBubble.tsx      # 漂亮的玻璃拟态消息气泡
 │   ├─ Callout.tsx         # callout UI block
 │   ├─ LoadingBar.tsx      # 加载进度条动画
 │   ├─ TypingDots.tsx      # 打字机效果（可选）
 │   └─ ui-render.tsx       # 核心渲染引擎（根据 kind 自动渲染组件）
 └─ types/
     └─ ui-block.ts         # UI Block 类型定义
🧭 Roadmap
 Image Block（图片渲染）

 Chart Block（ECharts/Chart.js）

 Audio Block（带波形可视化）

 Markdown Block（支持 heading/code/quote/table）

 File Preview Block（PDF、Excel、Doc）

 Code Block + Highlighting

 自定义 UI 插件系统

 完整的 AI 富媒体 NOTEBOOK 模式

🤝 Contributing
欢迎提出：

新的 UI Block 类型

Bug 修复

PR / Issue

示例 / Demo

Silva-Render 将持续迭代，成为 AI 时代的富媒体 UI 标准化层。

📄 License
MIT License — 做什么都可以，只需保留 license。

🌱 Why "Silva"?
Silva 在拉丁语中意为「森林」。
象征自然、生态、不断生长。
希望这个项目像森林一样，为未来的 AI UI 生长出更多的组件、更多的可能性。