import mammoth from 'mammoth'

export async function extractDocxText(file: Blob | ArrayBuffer): Promise<string> {
  const arrayBuffer = file instanceof Blob ? await file.arrayBuffer() : file
  const { value } = await mammoth.extractRawText({ arrayBuffer })
  return value || ''
}

