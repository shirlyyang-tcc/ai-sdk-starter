// Polyfill for TextEncoderStream
export class TextEncoderStream {
  encoder = new TextEncoder();
  transform;
  readable;
  writable;

  constructor() {
    this.transform = new TransformStream({
      transform: (chunk, controller) => {
        if (typeof chunk === 'object' && chunk !== null) {
          chunk = JSON.stringify(chunk);
        }
        // 确保输入是字符串
        const text = String(chunk);
        const encoded = this.encoder.encode(text);
        controller.enqueue(encoded);
      }
    });
    this.readable = this.transform.readable;
    this.writable = this.transform.writable;
    return this.transform;
  }

}
// Polyfill for TextDecoderStream
export class TextDecoderStream {
  decoder = new TextDecoder();
  transform;
  readable;
  writable;

  constructor() {
    this.transform = new TransformStream({
      transform: (chunk, controller) => {
        if (typeof chunk === 'object' && chunk !== null) {
          chunk = JSON.stringify(chunk);
        }
        // 确保输入是 Uint8Array
        const decoded = this.decoder.decode(chunk, { stream: true });
        if (decoded) {
          controller.enqueue(decoded);
        }
      },
      flush: (controller) => {
        // 处理最后的数据
        const final = this.decoder.decode(undefined, { stream: false });
        if (final) {
          controller.enqueue(final);
        }
      }
    });
    this.readable = this.transform.readable;
    this.writable = this.transform.writable;
    return this.transform;
  }
}

export class WritableStream {
  constructor({write, close}) {
    this.transform = new TransformStream({
      transform: (chunk, controller) => {
        if (typeof chunk === 'object' && chunk !== null) {
          chunk = JSON.stringify(chunk);
        }
        if (write) {
          write(chunk);
        } else {
          controller.enqueue(chunk);
        }
      },
      close: () => {
        if (close) {
          close();
        }
      }
    });
    return this.transform.writable
  }
}
export class ReadableStream {
  constructor({ start, pull, cancel }) {
    this.transform = new TransformStream({
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
    return this.transform.readable;
  }
}
globalThis.TextEncoderStream = TextEncoderStream;
globalThis.TextDecoderStream = TextDecoderStream;
globalThis.WritableStream = WritableStream;
globalThis.ReadableStream = ReadableStream;