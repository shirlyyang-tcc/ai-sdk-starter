import { createDeepSeek } from '@ai-sdk/deepseek'
import { generateText } from 'ai'

export async function onRequest(context) {
  try {
    // const { messages } = await context.request.json()
    const deepseek = createDeepSeek({
      apiKey: context.env.DEEPSEEK_API_KEY,
    })

    const { text } = await generateText({
      model: deepseek("deepseek-chat"),
      // messages,
      prompt: "Tell me a joke",
    });

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    })
  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { 
        status: 500,
        headers: {
          'content-type': 'application/json',
        },
      }
    )
  }
} 