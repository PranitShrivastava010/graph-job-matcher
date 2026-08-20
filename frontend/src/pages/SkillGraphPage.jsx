import React, { useEffect, useState } from 'react';
import { graphAPI } from '../services/api';
import InteractiveGraphCanvas from '../components/InteractiveGraphCanvas';
import { Layers, Terminal, Sparkles, RefreshCw } from 'lucide-react';

export default function SkillGraphPage() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    graphAPI.getGraphData()
      .then(res => setGraphData(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <Layers className="w-7 h-7 text-indigo-400" />
            <span>Interactive Graph Network</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Visual topology of candidates, skills, and job requirements loaded live from CognoDB openCypher instance.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-sm font-mono">Streaming subgraph nodes and edges...</span>
        </div>
      ) : (
        <InteractiveGraphCanvas graphData={graphData} />
      )}

      {/* Cypher Traversal Explanation */}
      <div className="bg-slate-850 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-slate-300 font-bold text-sm">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span>Live openCypher Query Behind This Subgraph</span>
        </div>
        <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-blue-300 overflow-x-auto border border-slate-800 leading-relaxed">
{`MATCH (n)
WHERE n:Skill OR n:Job OR n:Company OR n:User
WITH collect(DISTINCT n)[0..80] AS nodes
MATCH (a)-[r]->(b)
WHERE a IN nodes AND b IN nodes
RETURN nodes, collect(DISTINCT r) AS edges`}
        </pre>
      </div>
    </div>
  );
}
