import { describe, it, expect } from 'vitest';
import AppError from '../appError.js';

describe('AppError', () => {
  it('sets status to "fail" for 4xx codes', () => {
    const err = new AppError('Not Found', 404);
    expect(err.status).toBe('fail');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not Found');
    expect(err.isOperational).toBe(true);
  });

  it('sets status to "error" for 5xx codes', () => {
    const err = new AppError('Server Error', 500);
    expect(err.status).toBe('error');
  });

  it('preserves the stack trace', () => {
    const err = new AppError('Test', 400);
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain('appError.test.js');
  });

  it('is an instance of Error', () => {
    const err = new AppError('Test', 400);
    expect(err).toBeInstanceOf(Error);
  });

  it('handles edge case status codes', () => {
    expect(new AppError('', 499).status).toBe('fail');
    expect(new AppError('', 500).status).toBe('error');
    expect(new AppError('', 400).status).toBe('fail');
    expect(new AppError('', 503).status).toBe('error');
  });

  it('handles 3xx codes (neither 4xx nor 5xx)', () => {
    const err = new AppError('Redirect', 301);
    expect(err.status).toBe('error'); // doesn't start with "4"
  });
});
