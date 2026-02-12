"use client";

import { useState, useRef, useEffect } from "react";
import ChatBubble from "@/components/ChatBubble";
import { renderUIBlock } from "@/components/ui-render";
import LoadingBar from "@/components/LoadingBar";

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ===== ASR 状态 =====
  const [asrMode, setAsrMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const [asrHint, setAsrHint] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // TAB → 聚焦输入框
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

  // ===== TTS =====
  async function handleSpeak(text: string) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch (err) {
      console.error("TTS error:", err);
    }
  }

  // ===== 发送文本 =====
  async function send() {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input }),
    });

    const data = await res.json();
    setLoading(false);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: data.text, ui: data.ui || [] },
    ]);

    setInput("");
  }

  // ===== ASR：开始录音 =====
  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());

      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType,
      });

      setAsrHint("正在上传语音…");

      const fd = new FormData();
      fd.append("file", blob, "speech.webm");

      const up = await fetch("/api/asr/upload", {
        method: "POST",
        body: fd,
      });

      const { audioUrl } = await up.json();

      setAsrHint("语音已上传，等待识别");

      // 这里后面你会接 /api/asr/transcribe
      console.log("ASR audioUrl:", audioUrl);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  }

  function stopRecording() {
    const r = mediaRecorderRef.current;
    if (r && r.state !== "inactive") r.stop();
    setRecording(false);
  }

  return (
    <main
    style={{
      minHeight: "100vh",
      padding: 24,
      background: `
        radial-gradient(circle at 20% 20%, rgba(46,107,78,0.08), transparent 40%),
        radial-gradient(circle at 80% 30%, rgba(46,107,78,0.06), transparent 50%),
        linear-gradient(180deg, #f4faf7, #eef5f1)
      `,
    }}
  >

      {/* ===== Hero 区域 ===== */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 60,
          paddingTop: 40, 
        }}
      >
        <img
          src="https://guidoshar.com/wp-content/uploads/2025/11/ChatGPT-Image-2025年10月9日-下午04_37_26.png"
          alt="Guido Chat Logo"
          style={{
            width: 120,
            height: 120,
            borderRadius: 24,
            objectFit: "cover",
            boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
            marginBottom: 20,
          }}
        />

      <h1
        style={{
          fontSize: 42,
          fontWeight: 700,
          marginBottom: 20,
          color: "#le3f30",
          letterSpacing: 1,
        }}
      >
        Guido Chat
      </h1>

      <p
        style={{
          fontSize: 16,
          opacity: 0.7,
          marginTop: 12,
        }}
      >
        我的第一个富媒体项目，希望顺利，祝福我吧！
      </p>
      </div>

      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: 24,
          borderRadius: 24,
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx}>
            <ChatBubble
              role={msg.role}
              onSpeak={() => handleSpeak(msg.text)}
            >
              {msg.text}
            </ChatBubble>

            {msg.ui?.map((block: any, i: number) =>
              renderUIBlock(block, i)
            )}
          </div>
        ))}

        {loading && (
          <ChatBubble role="assistant">
            小夏等我一下，我正在想…
          </ChatBubble>
        )}

        <div style={{ marginTop: 20 }}>
          {loading ? (
            <LoadingBar />
          ) : asrMode ? (
            // ===== ASR 凹面输入 Bar =====
            <div
              onClick={() => {
                recording ? stopRecording() : startRecording();
              }}
              style={{
                cursor: "pointer",
                padding: 16,
                borderRadius: 18,
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(46,107,78,0.25)",
                boxShadow:
                  "inset 6px 6px 12px rgba(0,0,0,0.08), inset -6px -6px 12px rgba(255,255,255,0.9)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#244f38",
                  }}
                >
                  {recording
                    ? "🎙️ 正在录音，点击结束"
                    : "🎙️ 点击开始语音输入"}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.7,
                    marginTop: 4,
                  }}
                >
                  {asrHint || "说完自动上传"}
                </div>
              </div>

              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 18,
                  background: recording
                    ? "rgba(255,70,70,0.15)"
                    : "rgba(46,107,78,0.12)",
                }}
              >
                {recording ? "■" : "●"}
              </div>
            </div>
          ) : (
            // ===== 普通输入 =====
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
                onClick={() => {
                  setAsrMode(true);
                  setAsrHint("");
                }}
                style={{
                  padding: "0 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                }}
              >
                🎙️
              </button>

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
                }}
              >
                发送
              </button>
            </div>
          )}
        </div>

        {asrMode && !loading && (
          <div style={{ marginTop: 12, textAlign: "right" }}>
            <button
              onClick={() => {
                setAsrMode(false);
                setRecording(false);
              }}
              style={{
                fontSize: 12,
                opacity: 0.6,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              退出语音输入
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
