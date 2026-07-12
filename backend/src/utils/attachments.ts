export interface MessageAttachment {
  id: string;
  name: string;
  mimeType: string;
  dataUrl?: string;
  extractedText?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'text/plain',
]);

const MAX_ATTACHMENTS = 3;
const MAX_DATA_URL_LENGTH = 7_000_000;
const MAX_EXTRACTED_TEXT_LENGTH = 50_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid attachment ${field}.`);
  }
  return value.trim();
}

export function parseAttachments(input: unknown): MessageAttachment[] {
  if (input === undefined || input === null) return [];
  if (!Array.isArray(input)) {
    throw new Error('Invalid attachments payload.');
  }

  if (input.length > MAX_ATTACHMENTS) {
    throw new Error(`You can attach up to ${MAX_ATTACHMENTS} files.`);
  }

  return input.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`Invalid attachment at index ${index}.`);
    }

    const mimeType = asString(item.mimeType, 'mimeType');
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error('Unsupported attachment type.');
    }

    const attachment: MessageAttachment = {
      id: asString(item.id, 'id'),
      name: asString(item.name, 'name').slice(0, 120),
      mimeType,
    };

    if (mimeType.startsWith('image/')) {
      const dataUrl = asString(item.dataUrl, 'dataUrl');
      if (!dataUrl.startsWith('data:image/')) {
        throw new Error('Invalid image attachment.');
      }
      if (dataUrl.length > MAX_DATA_URL_LENGTH) {
        throw new Error('Image attachment is too large.');
      }
      attachment.dataUrl = dataUrl;
      return attachment;
    }

    const extractedText = asString(item.extractedText, 'extractedText').slice(0, MAX_EXTRACTED_TEXT_LENGTH);
    attachment.extractedText = extractedText;
    return attachment;
  });
}

export function buildUserMessageText(content: string, attachments: MessageAttachment[]): string {
  const textParts: string[] = [];

  for (const attachment of attachments) {
    if (attachment.extractedText) {
      textParts.push(`[Attached file: ${attachment.name}]\n${attachment.extractedText}`);
    }
  }

  if (content.trim()) {
    textParts.push(content.trim());
  } else if (attachments.some((attachment) => attachment.mimeType.startsWith('image/'))) {
    textParts.push('Please help me with this image.');
  }

  return textParts.join('\n\n');
}

export function historyHasImages(
  history: { role: string; content: string; attachments?: MessageAttachment[] }[],
): boolean {
  return history.some(
    (message) =>
      message.role === 'user' &&
      (message.attachments ?? []).some((attachment) => attachment.mimeType.startsWith('image/')),
  );
}
