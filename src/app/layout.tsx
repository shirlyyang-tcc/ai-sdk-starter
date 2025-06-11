import "./globals.css"

export const metadata = {
  title: "AI 助手",
  description: "基于 Vercel AI SDK 构建的智能助手",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
