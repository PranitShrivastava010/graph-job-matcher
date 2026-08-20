import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Route, 
  Share2, 
  Clock 
} from 'lucide-react';

export default function JobCard({ job, mode = 'STANDARD' }) {
  const isDirect = mode === 'DIRECT' || job.matchType === 'DIRECT';
  const isMultiHop = mode === 'MULTI_HOP' || job.matchType === 'MULTI_HOP_RELATED';

  return (
    <div className="group relative bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col justify-between">
      <div>
        {/* Top Badges & Match Indicators */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/40">
              {job.experienceLevel || 'Mid-Level'}
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {job.type || 'Full-time'}
            </span>
          </div>

          {/* Match Score Badge */}
          {isDirect && job.matchPercentage !== undefined && (
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
              job.matchPercentage >= 75
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : job.matchPercentage >= 40
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{job.matchPercentage}% Direct Match</span>
            </div>
          )}

          {isMultiHop && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm animate-pulse">
              <Route className="w-3.5 h-3.5" />
              <span>{job.bridgeCount || job.graphBridges?.length || 1} Graph Bridge{job.graphBridges?.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Job Title & Company */}
        <Link to={`/jobs/${job.id}`} className="block group-hover:text-blue-400 transition-colors">
          <h3 className="text-lg font-bold text-white tracking-tight mb-1.5">
            {job.title}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 mb-4">
          <div className="flex items-center space-x-1 text-slate-300 font-medium">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.company?.name || 'Tech Company'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{job.location || 'Remote'}</span>
          </div>
          {job.salaryRange && (
            <div className="flex items-center space-x-1 text-emerald-400 font-medium">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{job.salaryRange}</span>
            </div>
          )}
        </div>

        <p className="text-slate-300 text-xs leading-relaxed line-clamp-2 mb-4">
          {job.description}
        </p>

        {/* MULTI-HOP GRAPH PROOF SECTION */}
        {isMultiHop && job.graphBridges && job.graphBridges.length > 0 && (
          <div className="mb-4 bg-purple-950/30 border border-purple-800/40 rounded-xl p-3">
            <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-purple-300 mb-2">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Why you match (Transitive Graph Path):</span>
            </div>
            <div className="space-y-1.5">
              {job.graphBridges.slice(0, 2).map((bridge, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-[11px] bg-slate-900/60 px-2.5 py-1 rounded-lg border border-purple-900/30">
                  <span className="font-medium text-emerald-400 font-mono">{bridge.yourSkill}</span>
                  <span className="text-slate-500 text-[10px]">
                    --[:{bridge.relationship || 'RELATED_TO'}]--&gt;
                  </span>
                  <span className="font-semibold text-purple-300 font-mono">{bridge.requiredSkill}</span>
                  <span className="text-[10px] text-slate-400 ml-auto font-mono">({bridge.hops} hop)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Required Skills Badges */}
        <div className="mb-4">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">
            Required Stack:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.requiredSkills?.map((skill, idx) => {
              const isMatched = isDirect && job.matchedSkills?.includes(skill);
              return (
                <span
                  key={idx}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-medium ${
                    isMatched
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                      : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
                  }`}
                >
                  {isMatched && '✓ '}
                  {skill}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 flex items-center space-x-1 font-mono">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>
        </span>

        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 group-hover:translate-x-0.5 transition-transform"
        >
          <span>Explore Graph Match</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
