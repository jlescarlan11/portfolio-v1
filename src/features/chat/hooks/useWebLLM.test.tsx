import { describe, it, expect, vi, afterEach } from 'vitest';
import { isWebGPUSupported } from './useWebLLM';

describe('isWebGPUSupported', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns true when navigator.gpu exists', () => {
    vi.stubGlobal('navigator', { gpu: {} });
    expect(isWebGPUSupported()).toBe(true);
  });

  it('returns false when navigator.gpu is absent', () => {
    vi.stubGlobal('navigator', {});
    expect(isWebGPUSupported()).toBe(false);
  });
});
