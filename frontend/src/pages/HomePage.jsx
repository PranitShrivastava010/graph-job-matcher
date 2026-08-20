import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { graphAPI } from '../services/api';
import { 
  Network, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Route, 
  Cpu, 
  Database, 
  GitFork, 
  ShieldCheck, 
  Zap, 
  Layers 
} from 'lucide-react';

export default function HomePage() {
  const { user, demoProfiles, loginAsDemo } = useAuth();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    graphAPI.getHealth()
      .then(res => setHealth(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 graph-grid-bg opacity-40"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Cloud Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>Backed by CognoDB Graph Cloud & openCypher</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Career Matching Powered by <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Knowledge Graph Traversals
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Traditional SQL matching stops at exact keyword hits. NexusGraph leverages native graph relationships (<span className="text-purple-400 font-mono font-medium">:RELATED_TO</span>, <span className="text-purple-400 font-mono font-medium">:SUB_SKILL_OF</span>) to discover multi-hop career pathways and uncover bridge skills.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              to="/jobs"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25 flex items-center space-x-2 group transition-all"
            >
              <span>Explore Multi-Hop Matches</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/graph"
              className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold flex items-center space-x-2 transition-all hover:border-slate-600"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Inspect Visual Graph</span>
            </Link>
          </div>

          {/* 1-Click Evaluator Sandbox Profiles */}
          <div className="bg-slate-850/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 max-w-4xl mx-auto text-left shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Quick-Test Candidate Personas (1-Click Login for Wexa AI Evaluator)
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Preset Graph Ontologies</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {demoProfiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loginAsDemo(p.email)}
                  className="text-left p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-blue-500/60 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mb-2">{p.title}</div>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono truncate">
                    {p.skills?.slice(0, 3).join(' • ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Graph vs Relational Advantage Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why Graph Databases Outperform Relational Schemas
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Career intelligence is fundamentally about connected topology, not static flat tables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 hover:border-blue-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
              <Route className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Index-Free Adjacency</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Traversing from a Candidate to Skills to Related Tech to Jobs is a pointer-chase in CognoDB. In SQL, this requires 5+ recursive <code className="text-blue-400 font-mono">JOIN</code>s that degrade exponentially.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 hover:border-purple-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5">
              <GitFork className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Hop Transitive Proof</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              If a candidate knows <span className="text-slate-200 font-medium">Docker</span>, openCypher automatically bridges them to <span className="text-slate-200 font-medium">Kubernetes</span> jobs via semantic ontology edges, showing explicit traversal explanations.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">High-Leverage Skill Gap</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              By aggregating missing skill nodes across dream jobs, the graph instantly identifies the 1 single bridge skill that unlocks the maximum number of new career opportunities.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
