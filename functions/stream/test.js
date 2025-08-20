import "../utils/text-stream";

// Fixed version of the stream processing functions
const enqueue = (stream) => {
  return stream.pipeThrough(
    new TransformStream({
      transform: async (chunk, controller) => {
        console.log("Enqueue stage - Input:", chunk);
        controller.enqueue({
          type: "step-start",
          messageId: chunk.messageId || '1111111111',
          originalType: chunk.type
        });
      }
    })
  );
};

const handle = (stream) => {
  return stream.pipeThrough(
    new TransformStream({
      transform: async (chunk, controller) => {
        console.log("Handle stage - Input:", chunk);
        const chunkType = chunk.type;
        switch (chunkType) {
          case "init": {
            controller.enqueue(
              `init:${JSON.stringify({
                messageId: chunk.messageId,
              })}\n`
            );
            break;
          }
          case "step-start": {
            controller.enqueue(
              `step-start:${JSON.stringify({
                messageId: chunk.messageId,
                originalType: chunk.originalType
              })}\n`
            );
            break;
          }
          default: {
            throw new Error(`Unknown chunk type: ${chunkType}`);
          }
        }
      }
    })
  );
};

// Function to read all content from a stream
const readStreamContent = async (stream) => {
  const reader = stream.getReader();
  let content = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      content += value;
    }
  } finally {
    reader.releaseLock();
  }

  return content;
};

// Updated main function that reads stream content
const runStreamDemo = async () => {

  try {
    console.log('Processing stream...');

    // Create initial stream
    const initialStream = new ReadableStream({
      start: (controller) => {
        controller.enqueue({ type: "init", messageId: "inited...." });
        controller.close();
      },
      cancel: () => {
        console.log("Stream cancelled");
      },
    });
    const handleStream2 = handle(initialStream);
    // Process stream through enqueue and handle stages
    const enqueuedStream = enqueue(handleStream2);
    const handledStream = handle(enqueuedStream);

    // Read all content from the final stream
    const streamContent = await readStreamContent(handledStream);

    // Display results
    console.log('received stream content...', streamContent)
    console.log("Stream processing completed successfully!");

  } catch (error) {
    console.error("Error processing stream:", error);
  }
};

export function onRequest(context) {
  try {
    runStreamDemo();
    return new Response("test-finished");
  } catch (error) {
    console.error("Error processing stream:", error);
    return new Response("test-error" + error.message, { status: 500 });
  }
}