import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  ArrowLeft, 
  Briefcase, 
  Sparkles, 
  Share2, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    jobAPI.getJobDetail(id)
      .then(res => setJob(res.data.job))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        Loading job and graph match ontology...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        Job posting not found. <Link to="/jobs" className="text-blue-400 underline">Return to jobs</Link>
      </div>
    );
  }

  const userMatched = job.userMatchedSkills || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link to="/jobs" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Opportunities</span>
      </Link>

      <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-700/60 pb-8">
          <div>
            <div className="flex flex-wrap gap-2 items-center mb-3">
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-700 text-slate-200">
                {job.experienceLevel}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30">
                {job.type}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-slate-400">
              <div className="flex items-center space-x-1.5 text-slate-200 font-semibold">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>{job.company?.name}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{job.location}</span>
              </div>
              {job.salaryRange && (
                <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.salaryRange}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setApplied(true)}
            className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all ${
              applied
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
            }`}
          >
            {applied ? '✓ Application Submitted' : 'Apply for this Role'}
          </button>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
            Role Overview & Mission
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Required Skills Breakdown */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
            Required Knowledge Graph Nodes ({job.skills?.length || 0})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {job.skills?.map((skill) => {
              const isMatched = userMatched.includes(skill.name);
              return (
                <div
                  key={skill.name}
                  className={`p-4 rounded-2xl border ${
                    isMatched
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-white text-sm">{skill.name}</span>
                    {isMatched ? (
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>In Your Graph</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">{skill.category}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{skill.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
