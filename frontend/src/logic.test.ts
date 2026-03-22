import { describe, it, expect } from 'vitest';
import { ALL, RULES, TEMPLATES } from './App';

describe('Layer 1: Data Integrity', () => {
  it('Component count is exactly 147', () => {
    expect(ALL.length).toBe(147);
  });
  
  it('Component counts match documentation exactly per stage', () => {
    expect(ALL.filter(c => c.s === 1).length).toBe(9);
    expect(ALL.filter(c => c.s === 2).length).toBe(27);
    expect(ALL.filter(c => c.s === 3).length).toBe(12);
    expect(ALL.filter(c => c.s === 4).length).toBe(44);
    expect(ALL.filter(c => c.s === 5).length).toBe(24);
    expect(ALL.filter(c => c.s === 6).length).toBe(31);
  });
  
  it('Field integrity check', () => {
    const ids = new Set();
    ALL.forEach(c => {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.desc).toBeTruthy();
      expect(['beginner', 'intermediate', 'advanced'].includes(c.sk)).toBe(true);
      expect(c.s).toBeGreaterThanOrEqual(1);
      expect(c.s).toBeLessThanOrEqual(6);
      expect(ids.has(c.id)).toBe(false);
      ids.add(c.id);
    });
  });

  it('Every stage has at least one beginner component', () => {
    [1, 2, 3, 4, 5, 6].forEach(stage => {
      const beginners = ALL.filter(c => c.s === stage && c.sk === 'beginner');
      expect(beginners.length).toBeGreaterThan(0);
    });
  });

  it('Known component existence for validation safety', () => {
    const requiredIds = ['dedup-fuzzy', 'sft', 'rule-eval', 'train-model', 'lora'];
    requiredIds.forEach(req => {
      expect(ALL.some(c => c.id === req)).toBe(true);
    });
  });
});

describe('Layer 2: Validation Engine', () => {
  it('Empty pipeline fires no rules', () => {
    const fired = RULES.filter(r => r.check([]));
    expect(fired.length).toBe(0);
  });

  it('Correct minimal pipeline fires zero errors', () => {
    const pipeline = ['orig-data', 'pii-filter', 'dedup-exact', 'sft', 'rule-eval', 'hf-export'];
    // Filter out warnings/infos, only check if 'error' fires. Wait, test says NO errors.
    const ruleLevels = RULES.map(r => ({
      ...r, 
      active: r.check(pipeline),
      severity: typeof r.type === 'function' ? r.type('beginner') : r.type
    }));
    
    // Check if any rule evaluates to error
    const errors = ruleLevels.filter(r => r.active && r.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it('a1-gap: Triggers when gap exists', () => {
    const r = RULES.find(r => r.id === 'a1-gap')!;
    expect(r.check(['orig-data', 'sft'])).toBe(true); // 1, 4 (gap of 2, 3)
    expect(r.check(['orig-data', 'cleanse', 'sft'])).toBe(true); // gap of 3
    expect(r.check(['orig-data', 'cleanse'])).toBe(false);
  });

  it('c2-comp-no-model: Compression without trained model', () => {
    const r = RULES.find(r => r.id === 'c2-comp-no-model')!;
    // fp8-quant is compression. Assuming fp8-quant exists
    expect(r.check(['orig-data', 'fp8-quant'])).toBe(true);
    // with training model
    expect(r.check(['orig-data', 'sft', 'fp8-quant'])).toBe(false);
  });

  it('Autofix target IDs are consistent', () => {
    const autofixes = RULES.map(r => r.autofix).filter(Boolean) as string[];
    // verify every autofix exists in ALL
    autofixes.forEach(af => {
      expect(ALL.some(c => c.id === af)).toBe(true);
    });
  });
});

describe('Layer 3: Integration Tests', () => {
  it('Template Integrity', () => {
    TEMPLATES.forEach(t => {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.nodes.length).toBeGreaterThanOrEqual(4);
      
      const nodeSet = new Set(t.nodes);
      expect(nodeSet.size).toBe(t.nodes.length); // no duplicates
      
      t.nodes.forEach((n:string) => {
        expect(ALL.some(c => c.id === n)).toBe(true); // exists in registry
      });
    });
  });
  
  it('Templates pass validation', () => {
    TEMPLATES.forEach(t => {
      const activeErrors = RULES.filter(r => {
        if (!r.check(t.nodes)) return false;
        const severity = typeof r.type === 'function' ? r.type(t.sk as any) : r.type;
        return severity === 'error';
      });
      expect(activeErrors.length, `Template ${t.name} failed validation`).toBe(0);
    });
  });
});
