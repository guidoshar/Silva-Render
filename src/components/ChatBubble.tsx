"use client";

export default function ChatBubble({
  role,
  children,
  onSpeak, // 添加回调
}: {
  role: "user" | "assistant";
  children: any;
  onSpeak?: () => void; //可选，因为USER气泡不需要
}) {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginTop: 16,
        padding: "0 4px",
      }}
    >
      <div
        style={{
          position: "relative", // 为了后续可能添加的功能预留位置
          maxWidth: "72%",
          padding: "14px 18px",

          // 非对称圆角
          borderRadius: isUser
            ? "16px 16px 4px 16px"
            : "16px 16px 16px 4px",

          // 玻璃拟态背景
          background: isUser
            ? "linear-gradient(135deg, rgba(37,99,235,0.95), rgba(96,165,250,0.95))"
            : "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(244,244,245,0.7))",

          color: isUser ? "white" : "#1a1a1a",

          // 玻璃拟态边框
          border: isUser
            ? "1px solid rgba(255,255,255,0.25)"
            : "1px solid rgba(200,200,200,0.45)",

          // 双层阴影（立体效果）
          boxShadow: isUser
            ? "0 4px 12px rgba(37,99,235,0.35), inset 0 0 8px rgba(255,255,255,0.15)"
            : "0 4px 12px rgba(0,0,0,0.08), inset 0 0 10px rgba(255,255,255,0.25)",

          whiteSpace: "pre-wrap",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",

          // 修复拼写：transform，而不是 transfrom
          transition: "transform 0.15s ease-out",
        }}

        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {children}

        {/* Silva语音按钮 */}
        {!isUser && onSpeak && (
          <button
            onClick={onSpeak}
            style={{
              position: "absolute",
              bottom: -4,
              right: -4,
              border: "none",
              background: "rgba(255,255,255,0.65)",
              borderRadius: 12,
              padding: "3px 6px",
              fontSize: 12,
              cursor: "pointer",
              backdropFilter: "blur(6px)",
            }}
            title="让Silva读给你听"
          >
            🔊
          </button>
        )}
      </div>    
    </div>  
  );
}
