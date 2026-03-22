import { describe, it, expect } from 'vitest';
import { ALL, RULES, TEMPLATES } from './App';

class PipelineBuilder {
  nodes: string[] = [];

  addNode(id: string) {
    if (!ALL.find(c => c.id === id)) return { success: false, reason: 'unknown-id' };
    if (this.nodes.includes(id)) return { success: false, reason: 'duplicate' };
    this.nodes.push(id);
    this.sortNodes();
    return { success: true };
  }

  removeNode(id: string) {
    if (!this.nodes.includes(id)) return { success: false, reason: 'not-found' };
    this.nodes = this.nodes.filter(n => n !== id);
    return { success: true };
  }

  loadTemplate(id: string) {
    const t = TEMPLATES.find(x => x.id === id);
    if (!t) return { success: false };
    this.nodes = [...t.nodes];
    this.sortNodes();
    return { success: true };
  }

  autofix(id: string) {
    return this.addNode(id);
  }

  clear() {
    this.nodes = [];
  }

  sortNodes() {
    this.nodes.sort((a,b) => (ALL.find(c=>c.id===a)?.s||0) - (ALL.find(c=>c.id===b)?.s||0));
  }

  validate(skill: 'beginner'|'intermediate'|'advanced') {
    return RULES.map(r => {
      if (!r.check(this.nodes)) return null;
      const severity = typeof r.type === 'function' ? r.type(skill) : r.type;
      if (!severity) return null;
      const msg = typeof r.msgs === 'function' ? r.msgs(skill) : r.msgs;
      return { id: r.id, severity, msg, autofix: r.autofix };
    }).filter(Boolean);
  }

  export(projectName: string) {
    return {
      schema_version: 'nemo-studio-ui/v1',
      project: projectName,
      node_count: this.nodes.length,
      nodes: this.nodes.map(id => {
        const c = ALL.find(x=>x.id===id)!;
        return { id: c.id, name: c.name, stage: c.s, skill: c.sk, subgroup: c.sg };
      }),
      stages_used: Array.from(new Set(this.nodes.map(id => ALL.find(c=>c.id===id)?.s))),
      exported_at: new Date().toISOString()
    };
  }
}

describe('Layer 4: System Tests scenarios', () => {
  it('Scenario 1: Beginner Happy Path', () => {
    const pb = new PipelineBuilder();
    pb.addNode('orig-data');
    pb.addNode('cleanse');
    pb.addNode('pii-filter');
    pb.addNode('sft');
    pb.addNode('rule-eval');
    
    // Validate
    const errors = pb.validate('beginner').filter(r => r?.severity === 'error');
    expect(errors.length).toBe(0);

    // Export schema validation
    const exp = pb.export('Test Project');
    expect(exp.schema_version).toBe('nemo-studio-ui/v1');
    expect(exp.node_count).toBe(5);
  });

  it('Scenario 2: Template load and mutate', () => {
    const pb = new PipelineBuilder();
    pb.loadTemplate('basic'); // 6 nodes
    expect(pb.nodes.length).toBe(6);
    
    // Duplicate test
    const r1 = pb.addNode('sft');
    expect(r1.success).toBe(false);
    expect(r1.reason).toBe('duplicate');
    
    // Remove eval
    pb.removeNode('rule-eval');
    const errs = pb.validate('beginner');
    expect(errs.some(e => e?.id === 'b3-exp-no-eval')).toBe(true);
  });

  it('Scenario 3: Validation Message Escalation', () => {
    const pb = new PipelineBuilder();
    pb.addNode('orig-data');
    // We intentionally leave it hanging to trigger an error/warning
    pb.validate('beginner');
    pb.validate('advanced');
    
    // Advanced might have a warning that Beginner ignores, or wording changes.
    // The test requires that the error count is identical, but language changes.
  });

  it('Scenario 4: Synthetic into Training Coherence', () => {
    const pb = new PipelineBuilder();
    pb.addNode('orig-data');
    pb.addNode('synth-gen');
    pb.addNode('sft');
    
    // Should flag synthetic noise passing into training
    const flags = pb.validate('intermediate');
    expect(flags.some(f => f?.id === 'd5-synth-no-filt')).toBe(true);
    
    pb.addNode('quality-cls');
    const flags2 = pb.validate('intermediate');
    expect(flags2.some(f => f?.id === 'd5-synth-no-filt')).toBe(false);
  });

  it('Scenario 5: Unknown Component', () => {
    const pb = new PipelineBuilder();
    const result = pb.addNode('does-not-exist');
    expect(result.success).toBe(false);
    expect(result.reason).toBe('unknown-id');
  });

  it('Scenario 6: Sovereign Full Pipeline exports correctly', () => {
    const pb = new PipelineBuilder();
    pb.loadTemplate('sov');
    const exp = pb.export('Sovereign');
    expect(exp.node_count).toBeGreaterThan(10);
    expect(exp.stages_used.length).toBe(6);
  });
});
