import React from 'react';
import { Database, GitFork, Heart, Sparkles, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 py-10 mt-20 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">NexusGraph Engine</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Knowledge Graph Career & Skill Matcher built for the Wexa AI Take-Home Assignment. Powered by native openCypher over Bolt protocol on CognoDB Cloud.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Graph Features</h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-blue-400 transition-colors">1-Hop Direct Skill Overlap</li>
              <li className="hover:text-blue-400 transition-colors">2-Hop Transitive Related Matches</li>
              <li className="hover:text-blue-400 transition-colors">Graph Ontology Knowledge Base</li>
              <li className="hover:text-blue-400 transition-colors">High-Leverage Skill Gap Analysis</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Tech Stack</h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-400">Database: <span className="text-blue-400 font-mono">CognoDB Cloud</span></li>
              <li className="text-slate-400">Driver: <span className="text-blue-400 font-mono">neo4j-driver 5.x</span></li>
              <li className="text-slate-400">Backend: <span className="text-blue-400 font-mono">Node.js / Express</span></li>
              <li className="text-slate-400">Frontend: <span className="text-blue-400 font-mono">React / Tailwind</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            © 2026 NexusGraph. Candidate Take-Home Project for Wexa AI.
          </div>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Built with openCypher & CognoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
