import { describe, expect, it } from 'vitest';
import {
  buildUserMessageText,
  historyHasImages,
  parseAttachments,
} from './attachments';

describe('parseAttachments', () => {
  it('returns empty array for null/undefined', () => {
    expect(parseAttachments(null)).toEqual([]);
    expect(parseAttachments(undefined)).toEqual([]);
  });

  it('rejects non-array payload', () => {
    expect(() => parseAttachments({})).toThrow('Invalid attachments payload.');
  });

  it('rejects more than 3 attachments', () => {
    const items = Array.from({ length: 4 }, (_, i) => ({
      id: `id-${i}`,
      name: `file-${i}.txt`,
      mimeType: 'text/plain',
      extractedText: 'hello',
    }));
    expect(() => parseAttachments(items)).toThrow('You can attach up to 3 files.');
  });

  it('parses a valid text attachment', () => {
    const result = parseAttachments([
      {
        id: 'a1',
        name: 'notes.txt',
        mimeType: 'text/plain',
        extractedText: 'hola mundo',
      },
    ]);

    expect(result).toEqual([
      {
        id: 'a1',
        name: 'notes.txt',
        mimeType: 'text/plain',
        extractedText: 'hola mundo',
      },
    ]);
  });

  it('parses a valid image attachment', () => {
    const dataUrl = 'data:image/jpeg;base64,abc123';
    const result = parseAttachments([
      {
        id: 'img1',
        name: 'photo.jpg',
        mimeType: 'image/jpeg',
        dataUrl,
      },
    ]);

    expect(result[0]).toMatchObject({
      id: 'img1',
      mimeType: 'image/jpeg',
      dataUrl,
    });
  });

  it('rejects unsupported mime types', () => {
    expect(() =>
      parseAttachments([
        {
          id: 'x',
          name: 'doc.pdf',
          mimeType: 'application/pdf',
          extractedText: 'nope',
        },
      ]),
    ).toThrow('Unsupported attachment type.');
  });

  it('rejects image without valid data URL', () => {
    expect(() =>
      parseAttachments([
        {
          id: 'x',
          name: 'photo.jpg',
          mimeType: 'image/jpeg',
          dataUrl: 'http://example.com/photo.jpg',
        },
      ]),
    ).toThrow('Invalid image attachment.');
  });
});

describe('buildUserMessageText', () => {
  it('returns trimmed content when no attachments', () => {
    expect(buildUserMessageText('  hola  ', [])).toBe('hola');
  });

  it('includes extracted text from attachments', () => {
    const text = buildUserMessageText('explica esto', [
      {
        id: '1',
        name: 'vocab.txt',
        mimeType: 'text/plain',
        extractedText: 'manzana = apple',
      },
    ]);

    expect(text).toContain('[Attached file: vocab.txt]');
    expect(text).toContain('manzana = apple');
    expect(text).toContain('explica esto');
  });

  it('uses default prompt for image-only messages', () => {
    const text = buildUserMessageText('', [
      {
        id: '1',
        name: 'pic.jpg',
        mimeType: 'image/jpeg',
        dataUrl: 'data:image/jpeg;base64,xx',
      },
    ]);

    expect(text).toBe('Please help me with this image.');
  });
});

describe('historyHasImages', () => {
  it('detects images only on user messages', () => {
    expect(
      historyHasImages([
        {
          role: 'user',
          content: 'mira',
          attachments: [{ id: '1', name: 'a.jpg', mimeType: 'image/jpeg' }],
        },
      ]),
    ).toBe(true);

    expect(
      historyHasImages([
        {
          role: 'assistant',
          content: 'ok',
          attachments: [{ id: '1', name: 'a.jpg', mimeType: 'image/jpeg' }],
        },
      ]),
    ).toBe(false);

    expect(historyHasImages([{ role: 'user', content: 'hola' }])).toBe(false);
  });
});
