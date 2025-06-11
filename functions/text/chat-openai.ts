import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from "ai";

export async function onRequest(context) {
  try {
    // const { messages } = await context.request.json()
    const messages = [
      {
        role: "user",
        content: "Tell me the date of today",
      },
    ];

    const openai = createOpenAI({
      apiKey: context.env.OPENAI_API_KEY,
    });

    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      messages,
    });

    console.log("openai return text", text);
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { 
        status: 500,
        headers: {
          'content-type': 'application/json',
        },
      }
    )
  }
} 