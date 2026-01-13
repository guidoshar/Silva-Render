"use client";

export default function LoadingBar() {
  return (
    <>
      <style jsx global>{`
        @keyframes thinkingPulse {
          0%   { opacity: 0.3; }
          50%  { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}</style>

      <div
        style={{
          width: "100%",
          padding: "14px 18px",
          borderRadius: 14,
          background: "rgba(250, 252, 250, 0.9)",
          border: "1px solid #d6e4db",
          fontSize: 15,
          color: "#2e6b4e",
          animation: "thinkingPulse 1.6s ease-in-out infinite",
        }}
      >
        小夏等我一下，我正在思考中…
      </div>
    </>
  );
}
