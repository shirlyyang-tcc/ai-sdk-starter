// Polyfill for TextEncoderStream
export class TextEncoderStream {
  constructor() {
    const encoder = new TextEncoder();
    const transform = new TransformStream({
      transform: (chunk, controller) => {
        console.log("TextEncoderStream into");

        if (typeof chunk === 'object' && chunk !== null) {
          chunk = JSON.stringify(chunk);
        }
        // 确保输入是字符串
        const text = String(chunk);
        const encoded = encoder.encode(text);
        controller.enqueue(encoded);
      }
    });
    
    // 正确设置属性
    this.readable = transform.readable;
    this.writable = transform.writable;
    
    return transform;
  }
}

// Polyfill for TextDecoderStream
export class TextDecoderStream {
  constructor() {
    const decoder = new TextDecoder();
    
    const transform = new TransformStream({
      start: (controller) => {
        console.log("TextDecoderStream start called");
      },
      
      transform: (chunk, controller) => {
        console.log("TextDecoderStream input:", typeof chunk, chunk);
        
        try {
          if (chunk instanceof Uint8Array || ArrayBuffer.isView(chunk)) {
            // 流式解码，立即输出
            const decoded = decoder.decode(chunk, { stream: true });
            console.log("Decoded to string:", decoded);
            if (decoded) {
              controller.enqueue(decoded);
            }
          } else if (typeof chunk === 'string') {
            console.log("Already string, output:", chunk);
            controller.enqueue(chunk);
          } else if (chunk === null || chunk === undefined) {
            console.log("Null/undefined chunk, ignoring");
          } else {
            const str = String(chunk);
            console.log("Converted to string:", str);
            controller.enqueue(str);
          }
        } catch (error) {
          console.error("TextDecoderStream transform error:", error);
          // 错误时输出错误信息，避免阻塞
          controller.enqueue(`[Error: ${error.message}]`);
        }
      },
      
      flush: (controller) => {
        try {
          console.log("TextDecoderStream flush called");
          const final = decoder.decode();
          if (final) {
            console.log("Flush final:", final);
            controller.enqueue(final);
          }
          console.log("TextDecoderStream flush completed");
        } catch (error) {
          console.error("TextDecoderStream flush error:", error);
        }
      },
      
      cancel: (reason) => {
        console.log("TextDecoderStream cancelled:", reason);
      }
    });
    
    // 正确设置属性
    this.readable = transform.readable;
    this.writable = transform.writable;
    
    // 关键：返回 this，不是 transform
    return transform;
  }
}

export class WritableStream {
  constructor({ write, close, abort }) {
    // 创建内部的 TransformStream
    const transform = new TransformStream({
      transform: (chunk, controller) => {
        console.log("WritableStream transform called", write);
        if (write) {
          try {
            write(chunk);
          } catch (error) {
            console.error("WritableStream write error:", error);
            controller.error(error);
          }
        } else {
          // 如果没有 write 函数，直接传递数据
          controller.enqueue(chunk);
        }
      },
      flush: (controller) => {
        if (close) {
          try {
            close();
          } catch (error) {
            console.error("WritableStream close error:", error);
          }
        }
      }
    });
    // 关键：后台 drain 掉 readable，彻底消除背压
    (async () => {
      const reader = transform.readable.getReader();
      try {
        for (; ;) {
          const { done } = await reader.read();
          if (done) break;
          // 丢弃数据（我们从不 enqueue，所以一般没有数据）
        }
      } catch (_) {
        // 忽略
      } finally {
        reader.releaseLock();
      }
    })();

    const writable = transform.writable;
    // 透传 abort，避免 pipeTo 清理阶段卡住
    const origAbort = writable.abort?.bind(writable);
    writable.abort = async (reason) => { 
      if (abort) await Promise.resolve(abort(reason));
      if (origAbort) return origAbort(reason);
    };
    // 返回 writable 部分
    return writable;
  }
}

export class ReadableStream {
  constructor({ start, pull, cancel }) {
    const transform = new TransformStream({
      start: (controller) => {
        if (start) {
          start(controller);
        } else {
          controller.enqueue("error");
        }
      },
      pull: (controller) => {
        if (pull) {
          pull(controller);
        }
      },
      cancel: (controller) => {
        if (cancel) {
          cancel(controller);
        }
      }
    });
    
    return transform.readable;
  }
}

// 只在全局对象不存在时才设置 polyfill
  globalThis.TextEncoderStream = TextEncoderStream;
  globalThis.TextDecoderStream = TextDecoderStream;
  globalThis.WritableStream = WritableStream;
  // globalThis.ReadableStream = ReadableStream;
