export const MAX_ATTACHMENTS = 3
export const MAX_FILE_BYTES = 5 * 1024 * 1024
const MAX_IMAGE_DIMENSION = 1280
const JPEG_QUALITY = 0.82

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

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
    reader.readAsText(file)
  })
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Could not read ${file.name}`))
    }
    image.src = url
  })
}

async function compressImage(file: File): Promise<string> {
  const image = await loadImageElement(file)
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error(`Could not process ${file.name}`)
  }

  context.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
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
    const dataUrl = await compressImage(file)
    return {
      id,
      name: file.name,
      mimeType: 'image/jpeg',
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
