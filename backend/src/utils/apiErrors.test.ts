import { afterEach, describe, expect, it } from 'vitest';
import { getErrorMessage, getHttpStatus, getUserError, USER_ERRORS } from './apiErrors';

describe('getHttpStatus', () => {
  it('reads numeric status from error objects', () => {
    expect(getHttpStatus({ status: 429 })).toBe(429);
    expect(getHttpStatus({ status: 401 })).toBe(401);
  });

  it('defaults to 500', () => {
    expect(getHttpStatus(new Error('boom'))).toBe(500);
    expect(getHttpStatus(null)).toBe(500);
  });
});

describe('getErrorMessage', () => {
  it('returns Error.message or fallback', () => {
    expect(getErrorMessage(new Error('network down'))).toBe('network down');
    expect(getErrorMessage('weird')).toBe('Internal server error');
    expect(getErrorMessage(null, 'fallback')).toBe('fallback');
  });
});

describe('getUserError', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('maps conversation-not-found errors', () => {
    process.env.NODE_ENV = 'production';
    expect(getUserError(new Error('Conversation not found'), 'fallback')).toBe(
      USER_ERRORS.CONVERSATION_NOT_FOUND,
    );
  });

  it('maps missing attachments column errors', () => {
    process.env.NODE_ENV = 'production';
    expect(
      getUserError(new Error('column attachments does not exist'), 'fallback'),
    ).toContain('Attachments are not enabled');
  });

  it('passes through attachment validation messages', () => {
    process.env.NODE_ENV = 'production';
    expect(getUserError(new Error('Unsupported attachment type.'), 'fallback')).toBe(
      'Unsupported attachment type.',
    );
  });

  it('hides unknown messages in production', () => {
    process.env.NODE_ENV = 'production';
    expect(getUserError(new Error('secret stack'), 'Safe fallback')).toBe('Safe fallback');
  });

  it('exposes messages in development', () => {
    process.env.NODE_ENV = 'development';
    expect(getUserError(new Error('secret stack'), 'Safe fallback')).toBe('secret stack');
  });
});
