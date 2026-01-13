"use client";

import { useState, useRef, useEffect } from "react";
import ChatBubble from "@/components/ChatBubble";
import { renderUIBlock } from "@/components/ui-render";
import TypingDots from "@/components/TypingDots";
import LoadingBar from "@/components/LoadingBar";

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // TAB → 自动聚焦输入框
  useEffect(() => {
    function handleTab(e: KeyboardEvent) {
      if (e.key === "Tab") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, []);

  async function handleSpeak(text: string) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      
      // 检查响应状态
      if (!res.ok) {
        let errorMessage = `HTTP ${res.status}: ${res.statusText || "无法生成语音"}`;
        try {
          const errorData = await res.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          } else if (Object.keys(errorData).length > 0) {
            errorMessage = JSON.stringify(errorData);
          }
        } catch {
          // 如果不是 JSON，尝试读取文本
          try {
            const errorText = await res.text();
            if (errorText) errorMessage = errorText;
          } catch {
            // 忽略
          }
        }
        console.error("TTS API Error:", errorMessage);
        alert(`TTS 错误: ${errorMessage}`);
        return;
      }
      
      // 检查 Content-Type 是否为音频格式
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.startsWith("audio/")) {
        const errorText = await res.text();
        console.error("TTS 返回了非音频格式:", errorText);
        alert("TTS 返回了无效的音频格式");
        return;
      }
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      const audio = new Audio(url);
      
      // 添加错误处理
      audio.onerror = (e) => {
        console.error("音频播放错误:", e);
        URL.revokeObjectURL(url); // 清理 URL
        alert("音频播放失败，请检查音频格式是否被浏览器支持");
      };
      
      // 播放完成后清理 URL
      audio.onended = () => {
        URL.revokeObjectURL(url);
      };
      
      await audio.play();
    } catch (err) {
      console.error("TTS Error:", err);
      alert(`TTS 错误: ${err instanceof Error ? err.message : "未知错误"}`);
    }
  }
  async function send() {
    if (!input.trim()) return;

    // 添加用户消息
    setMessages((prev) => [...prev, { role: "user", text: input }]);

    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input }),
    });

    const data = await res.json();
    setLoading(false);

    // 添加助手消息
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: data.text, ui: data.ui || [] },
    ]);

    setInput("");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        background: "linear-gradient(180deg, #e8f4ec, #edf7f3, #f4faf7)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* 顶部标题 */}
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 20,
          color: "#244f38",
        }}
      >
        Guido Chat
      </h1>

      {/* 聊天区域 */}
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "24px",
          borderRadius: 24,
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx}>
            {/* 气泡 */}
            <ChatBubble 
            role={msg.role}
            onSpeak={() => handleSpeak(msg.text)}
            >
              {msg.text}
            </ChatBubble>

            {/* 富媒体 UI 渲染 */}
            {msg.ui?.map((block: any, i: number) => renderUIBlock(block, i))}
          </div>
        ))}

        {/* 加载中 */}
        {loading && (
          <ChatBubble role="assistant">小夏等我一下，我正在想…</ChatBubble>
        )}

        {/* 输入框区域 */}
        <div style={{ marginTop: 20 }}>
          {loading ? (
            // 正在加载 → 显示大的 loading bar
            <LoadingBar />
          ) : (
            // 未加载 → 正常输入框 + 按钮
            <div style={{ display: "flex", gap: 12 }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={3}
                placeholder="对我说点什么吧，小夏"
                style={{
                  flexGrow: 1,
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #c4d9cf",
                  background: "rgba(255,255,255,0.8)",
                  resize: "none",
                  fontSize: 15,
                }}
              />

              <button
                onClick={send}
                style={{
                  padding: "0 16px",
                  borderRadius: 12,
                  background: "#2e6b4e",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 15,
                  minWidth: 60,
                }}
              >
                发送
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
