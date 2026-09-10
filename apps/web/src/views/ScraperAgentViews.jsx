import { useState } from 'react';

const getBadgeStyle = (type) => {
  switch (type) {
    case 'PLAN':
      return { background: '#f3e8ff', color: '#7e22ce', borderColor: '#d8b4fe' };
    case 'SEARCH':
      return { background: '#dbeafe', color: '#1d4ed8', borderColor: '#93c5fd' };
    case 'SCRAPE':
      return { background: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' };
    case 'ANALYZE':
      return { background: '#d1fae5', color: '#047857', borderColor: '#6ee7b7' };
    case 'DECIDE':
      return { background: '#ffe4e6', color: '#be123c', borderColor: '#fda4af' };
    default:
      return { background: '#f3f4f6', color: '#374151', borderColor: '#e5e7eb' };
  }
};

export default function ScraperAgentView() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [error, setError] = useState(null);

  const handleRunAgent = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setAgentData(null);
    setError(null);

    try {
      const res = await fetch('http://127.0.0.1:5055/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: prompt.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Agent execution failed');
      setAgentData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 text-neutral-200">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Autonomous Research Agent</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Give an objective, topic, or question. The agent autonomously searches, reads, and analyzes the web.
        </p>
      </div>

      <form onSubmit={handleRunAgent} className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. Research Nikola Tesla's wireless power experiments"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-200 disabled:opacity-50 transition"
        >
          {loading ? 'Agent Researching...' : 'Deploy Agent'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 text-sm rounded-lg">
          {error}
        </div>
      )}

      {agentData && (
        <div className="space-y-6 text-left">
          {/* Real-time Agent Step Trace */}
          <div className="border border-neutral-800 rounded-xl p-5 bg-neutral-900/60 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Agent Execution Trace & Tool Invocations
            </h3>
            <div className="space-y-2">
              {agentData.trace?.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800"
                >
                  <span
                    style={getBadgeStyle(step.type)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0"
                  >
                    {step.type}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-neutral-200">{step.action}</p>
                    <p className="text-xs text-neutral-400 font-mono break-all">{step.observation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Synthesized Output */}
          <div className="border border-neutral-800 rounded-xl p-5 bg-neutral-900/60 space-y-4">
            <div className="border-b border-neutral-800 pb-3">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700 uppercase">
                Goal Reached
              </span>
              <h3 className="text-lg font-bold text-white mt-2">{agentData.title}</h3>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Executive Synthesis
              </h4>
              <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-950 p-3.5 rounded-lg border border-neutral-800 whitespace-pre-line">
                {agentData.executiveSummary}
              </p>
            </div>

            {agentData.keyPoints?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Key Insights & Findings
                </h4>
                <div className="space-y-1.5">
                  {agentData.keyPoints.map((pt, i) => (
                    <div
                      key={i}
                      className="text-xs text-neutral-300 bg-neutral-950 p-2.5 rounded border border-neutral-800/80 flex items-start gap-2"
                    >
                      <span className="text-neutral-500 font-bold">•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}