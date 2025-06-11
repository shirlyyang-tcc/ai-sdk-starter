import { Chat } from "@/components/chat"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">AI 助手</h1>
            <p className="text-muted-foreground">
              基于 Vercel AI SDK 构建的智能助手，随时为您提供帮助
            </p>
          </div>
          <Chat />
        </div>
      </div>
    </main>
  )
}
