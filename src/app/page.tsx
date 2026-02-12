"use client";

import { useState, useRef, useEffect } from "react";
import ChatBubble from "@/components/ChatBubble";
import { renderUIBlock } from "@/components/ui-render";
import LoadingBar from "@/components/LoadingBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStop } from "@fortawesome/free-solid-svg-icons";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

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
        padding: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `
        url("/silva.png")
      `,
      }}
    >
      {/* ===== 主卡片 ===== */}
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          padding: "120px 70px 60px",
          borderRadius: 40,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(30px)",
          boxShadow:
            "0 50px 120px rgba(0,0,0,0.08), 0 10px 30px rgba(0,0,0,0.06)",
          position: "relative",
          transition: "all 0.4s ease",
        }}
      >
        {/* ===== 悬浮 Logo ===== */}
        <div
          style={{
            position: "absolute",
            top: -60,
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            padding: 12,
            borderRadius: 28,
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
          }}
        >
          <img
            src="https://guidoshar.com/wp-content/uploads/2025/11/ChatGPT-Image-2025年10月9日-下午04_37_26.png"
            alt="Guido Chat Logo"
            style={{
              width: 120,
              height: 120,
              borderRadius: 20,
              objectFit: "cover",
            }}
          />
        </div>

        {/* ===== 标题区 ===== */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 700,
              marginBottom: 12,
              color: "#1f3f30",
              letterSpacing: 1,
            }}
          >
            Guido Chat
          </h1>

          <p
            style={{
              fontSize: 15,
              opacity: 0.65,
            }}
          >
            我的第一个富媒体项目，希望顺利。祝福我吧。
          </p>
        </div>

        {/* ===== 空状态 ===== */}
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              opacity: 0.55,
              marginBottom: 40,
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 12 }}>
              今天有什么想聊聊的吗？
            </div>
            <div style={{ fontSize: 14 }}>Silva 在这听你说。</div>
          </div>
        )}

        {/* ===== 聊天区 ===== */}
        {messages.map((msg, idx) => (
          <div key={idx}>
            <ChatBubble role={msg.role} onSpeak={() => handleSpeak(msg.text)}>
              {msg.text}
            </ChatBubble>
            {msg.ui?.map((block: any, i: number) => renderUIBlock(block, i))}
          </div>
        ))}

        {loading && (
          <ChatBubble role="assistant">小夏等我一下，我正在想…</ChatBubble>
        )}

        {/* ===== 输入区 ===== */}
        <div style={{ marginTop: 30 }}>
          {loading ? (
            <LoadingBar />
          ) : (
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "stretch",
              }}
            >
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
                  padding: 18,
                  borderRadius: 20,
                  border: "1px solid rgba(0,0,0,0.05)",
                  background: "rgba(255,255,255,0.95)",
                  resize: "none",
                  fontSize: 16,
                  boxShadow: "inset 3px 3px 8px rgba(0,0,0,0.05)",
                }}
              />

              {/* 🎙 语音按钮 */}
              <button
                onClick={() => {
                  recording ? stopRecording() : startRecording();
                }}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  background: recording
                    ? "linear-gradient(135deg,#ff4b4b,#e60023)"
                    : "rgba(46,107,78,0.12)",
                  color: recording ? "white" : "#2e6b4e",
                  boxShadow: recording
                    ? "0 10px 25px rgba(172, 47, 47, 0.3)"
                    : "0 6px 18px rgba(46,107,78,0.15)",
                  transition: "all 0.2s ease",
                }}
              >
                <FontAwesomeIcon icon={recording ? faStop : faMicrophone} />
              </button>

              <button
                onClick={send}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  background: "linear-gradient(135deg,#2f6f52,#3c8764)",
                  color: "white",
                  boxShadow: "0 14px 30px rgba(46,107,78,0.28)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(46,107,78,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 14px 30px rgba(46,107,78,0.28)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translateY(1px)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
