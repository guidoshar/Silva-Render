import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guido Chat",
  description: "A amazing application powered by Guido",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, fontFamily: "system-ui, nano-serif" }}>
        {children}
      </body>
    </html>
  );
}
