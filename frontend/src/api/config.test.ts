import { describe, it, expect } from 'vitest';
import { MODEL_PRICING, getModelPricing, type ModelPricing } from './config';

describe('MODEL_PRICING table', () => {
  it('contains all five models from the plan', () => {
    const expected = [
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'deepseek-chat',
      'deepseek-reasoner',
      'gpt-4o-mini',
    ];
    for (const id of expected) {
      expect(MODEL_PRICING[id]).toBeDefined();
    }
  });

  it('stores strictly positive per-1M costs', () => {
    for (const [id, pricing] of Object.entries(MODEL_PRICING)) {
      expect(pricing.input_per_1m, `${id} input cost`).toBeGreaterThan(0);
      expect(pricing.output_per_1m, `${id} output cost`).toBeGreaterThan(0);
      expect(pricing.output_per_1m, `${id} output >= input`).toBeGreaterThanOrEqual(
        pricing.input_per_1m,
      );
    }
  });

  it('is frozen — table entries cannot be mutated at runtime', () => {
    expect(Object.isFrozen(MODEL_PRICING)).toBe(true);
    for (const pricing of Object.values(MODEL_PRICING)) {
      expect(Object.isFrozen(pricing)).toBe(true);
    }
  });

  it('ModelPricing type is exported and usable for explicit annotations', () => {
    const pricing: ModelPricing = getModelPricing('gpt-4o-mini');
    expect(pricing.input_per_1m).toBe(0.15);
    expect(pricing.output_per_1m).toBe(0.60);
  });
});

describe('getModelPricing', () => {
  it('returns the correct pricing for a known model', () => {
    const pricing = getModelPricing('deepseek-chat');
    expect(pricing.input_per_1m).toBe(0.14);
    expect(pricing.output_per_1m).toBe(0.28);
  });

  it('returns zero-cost default for an unknown model (no NaN risk)', () => {
    const pricing = getModelPricing('some-future-model-v3');
    expect(pricing.input_per_1m).toBe(0);
    expect(pricing.output_per_1m).toBe(0);
  });

  it('returns a fresh object each call for unknown models (no shared mutation)', () => {
    const a = getModelPricing('unknown-model');
    const b = getModelPricing('unknown-model');
    expect(a).not.toBe(b);
    a.input_per_1m = 999;
    expect(b.input_per_1m).toBe(0);
  });

  it('returns zero-cost default for empty string', () => {
    const pricing = getModelPricing('');
    expect(pricing.input_per_1m).toBe(0);
    expect(pricing.output_per_1m).toBe(0);
  });
});
