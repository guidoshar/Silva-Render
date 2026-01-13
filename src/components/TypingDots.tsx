"use client";

export default function TypingDots() {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginLeft: 8,
        }}>

            <span className="dot" />
            <span className="dot" />
            <span className="dot" />

            <style jsx>{`
                .dot {
                    width: 6px;
                    height: 6px;
                    background: #2e6b4e;
                    border-radius: 50%;
                    display: inline-block;
                    animation: blink 1.4s infinite both;
                }
                .dot:nth-child(2) {
                    animation-delay: 0.2s;
                }
                .dot:nth-child(3) {
                    animation-delay: 0.4s;
                }
                
                @keyframes blink {
                    0% { opacity: 0.2; }
                    20% { opacity: 1; }
                    100% { opacity: 0.2; }
                }
            `}</style>
        </div>
    );
}