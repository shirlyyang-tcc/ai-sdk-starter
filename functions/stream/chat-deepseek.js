import { createDeepSeek } from "@ai-sdk/deepseek";
import { streamText } from "ai";
import "../utils/text-stream";

export async function onRequest(context) {
  try {
    // const { messages } = await context.request.json()  
    const deepseek = createDeepSeek({
      apiKey: context.env.DEEPSEEK_API_KEY,
    });
    let result;
    try {
      result = await streamText({
        model: deepseek("deepseek-chat"),
        messages: [
          {
            role: "user",
            content: "Tell me a joke",
          },
        ],
        onError({ error }) {
          console.log("inner stream error", error); // your error logging logic here
        },
      });
    } catch (e) {
      console.log("++++++stream error", e);
    }
    const textStream = result.textStream;
    console.log("check result stream", textStream);

    // const reader = textStream.getReader();
    // console.log("++++++reader", reader);
    // const { done, value } = await reader.read();
    // // reader.releaseLock();
    // console.log("++++++hasReadableStreamData", done, value);
    // return new Response(textStream);
    return new Response(
      textStream.pipeThrough(new TextEncoderStream()),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      }
    );


    // return new Response(JSON.stringify({ text: '123' }));
  } catch (error) {
    console.log("Chat API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
        apiKey: context.env.DEEPSEEK_API_KEY,
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }
}
