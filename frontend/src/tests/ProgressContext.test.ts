import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from '../context/ProgressContext';

describe('formatRelativeTime helper', () => {
  it('formats recent timestamps as Just now', () => {
    const now = Date.now();
    expect(formatRelativeTime(now)).toBe('Just now');
    expect(formatRelativeTime(now - 10000)).toBe('Just now');
  });

  it('formats minute level timestamps correctly', () => {
    const now = Date.now();
    const fiveMinsAgo = now - 5 * 60 * 1000;
    expect(formatRelativeTime(fiveMinsAgo)).toBe('5m ago');
  });

  it('formats hour level timestamps correctly', () => {
    const now = Date.now();
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });

  it('formats day level timestamps correctly', () => {
    const now = Date.now();
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
  });

  it('handles existing string fallbacks gracefully', () => {
    expect(formatRelativeTime('Just now')).toBe('Just now');
    expect(formatRelativeTime('15m ago')).toBe('15m ago');
  });
});
