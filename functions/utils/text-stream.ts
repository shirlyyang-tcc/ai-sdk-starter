// Polyfill for TextEncoderStream
export class TextEncoderStream {
  private encoder = new TextEncoder();
  private transform: TransformStream<string, Uint8Array>;

  constructor() {
    this.transform = new TransformStream({
      transform: (chunk, controller) => {
        // 确保输入是字符串
        const text = String(chunk);
        const encoded = this.encoder.encode(text);
        controller.enqueue(encoded);
      }
    });
  }

  get readable() {
    return this.transform.readable;
  }

  get writable() {
    return this.transform.writable;
  }
}
// Polyfill for TextDecoderStream
export class TextDecoderStream {
  private decoder = new TextDecoder();
  private transform: TransformStream<Uint8Array, string>;

  constructor(label = 'utf-8', options = {}) {
    this.transform = new TransformStream({
      transform: (chunk, controller) => {
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
  }

  get readable() {
    return this.transform.readable;
  }

  get writable() {
    return this.transform.writable;
  }
}
// globalThis.TextEncoderStream = TextEncoderStream;
globalThis.TextDecoderStream = TextDecoderStream;
