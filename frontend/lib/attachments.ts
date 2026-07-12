export const MAX_ATTACHMENTS = 3
export const MAX_FILE_BYTES = 5 * 1024 * 1024

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'text/plain',
])

export interface MessageAttachment {
  id: string
  name: string
  mimeType: string
  dataUrl?: string
  extractedText?: string
}

export interface PendingAttachment extends MessageAttachment {
  previewUrl?: string
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
    reader.readAsDataURL(file)
  })
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
    reader.readAsText(file)
  })
}

export function isAttachmentTypeAllowed(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType)
}

export async function processAttachmentFile(file: File): Promise<PendingAttachment> {
  if (!isAttachmentTypeAllowed(file.type)) {
    throw new Error('Only images (JPG, PNG, WebP, GIF) and .txt files are supported.')
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${file.name} is too large. Max size is 5 MB.`)
  }

  const id = crypto.randomUUID()

  if (file.type.startsWith('image/')) {
    const dataUrl = await readAsDataUrl(file)
    return {
      id,
      name: file.name,
      mimeType: file.type,
      dataUrl,
      previewUrl: dataUrl,
    }
  }

  const extractedText = (await readAsText(file)).trim()
  if (!extractedText) {
    throw new Error(`${file.name} is empty.`)
  }

  return {
    id,
    name: file.name,
    mimeType: file.type,
    extractedText,
  }
}

export function toMessageAttachment(attachment: PendingAttachment): MessageAttachment {
  return {
    id: attachment.id,
    name: attachment.name,
    mimeType: attachment.mimeType,
    dataUrl: attachment.dataUrl,
    extractedText: attachment.extractedText,
  }
}

export function revokeAttachmentPreview(attachment: PendingAttachment): void {
  if (attachment.previewUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(attachment.previewUrl)
  }
}
