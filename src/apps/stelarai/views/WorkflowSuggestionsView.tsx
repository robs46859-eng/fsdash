import React from "react";
import { Lightbulb, Check, X, ArrowRight } from "lucide-react";

export function WorkflowSuggestionsView() {
  const suggestions = [
    {
      id: "s1",
      title: "Optimized Model Lane",
      description: "Based on previous execution latency, moving the 'Refine' node to the Cheap lane could save $0.12 per run with 98% accuracy retention.",
      diff: { from: "balanced", to: "cheap" },
    },
    {
      id: "s2",
      title: "Parallelize Validation",
      description: "The 'Syntax Check' and 'Safety Filter' nodes can be parallelized to reduce total duration by 400ms.",
      diff: { from: "sequential", to: "parallel" },
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-surface">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lightbulb size={32} />
          </div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-on-surface">AI Workflow Suggestions</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Intelligent optimizations detected for your active workflows.</p>
        </header>

        <div className="space-y-6">
          {suggestions.map(s => (
            <div key={s.id} className="glass-panel p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Suggestion {s.id}</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">{s.title}</h3>
              <p className="text-sm leading-6 text-on-surface-variant mb-6">{s.description}</p>
              
              <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-4 flex items-center justify-center gap-8 mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant line-through">{s.diff.from}</span>
                <ArrowRight size={16} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">{s.diff.to}</span>
              </div>

              <div className="flex items-center gap-4">
                <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <Check size={18} /> Apply Suggestion
                </button>
                <button className="px-6 py-3 rounded-xl border border-outline-variant text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high">
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
