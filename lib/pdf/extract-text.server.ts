import 'server-only'
import { PDFParse } from 'pdf-parse'

export async function extractPdfText(file: Blob | ArrayBuffer | Uint8Array | Buffer): Promise<string> {
  const buffer = await toBuffer(file)
  const parser = new PDFParse({ data: buffer })
  const result = await parser.getText()
  await parser.destroy()
  return result.text ?? ''
}

async function toBuffer(input: Blob | ArrayBuffer | Uint8Array | Buffer): Promise<Buffer> {
  if (Buffer.isBuffer(input)) return input
  if (input instanceof Uint8Array) return Buffer.from(input)
  if (input instanceof ArrayBuffer) return Buffer.from(input)
  if (typeof (globalThis as any).Blob !== 'undefined' && input instanceof Blob) {
    return Buffer.from(await input.arrayBuffer())
  }
  throw new Error('Unsupported input for pdf-parse')
}
