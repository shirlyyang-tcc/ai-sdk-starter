import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from "ai";

export async function onRequest(context) {
  try {
    // const { messages } = await context.request.json()
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "What is an embedding model according to this document?",
          }
        ],
      },
    ];

    const google = createGoogleGenerativeAI({
      apiKey: context.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      // messages,
      prompt: "Tell me a joke",
    });
    console.log("google return text", text);
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });
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