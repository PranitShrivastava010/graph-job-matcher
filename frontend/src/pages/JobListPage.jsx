import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../services/api';
import JobCard from '../components/JobCard';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Briefcase, 
  CheckCircle2, 
  Route, 
  ArrowUpDown, 
  Plus, 
  Unlock, 
  RefreshCw,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function JobListPage() {
  const { user, isAuthenticated, updateUserSkills } = useAuth();
  const [activeTab, setActiveTab] = useState('DIRECT'); // 'DIRECT', 'MULTI_HOP', 'SKILL_GAP', 'ALL'
  
  // Data states
  const [directJobs, setDirectJobs] = useState([]);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  
  // Filter states
  const [search, setSearch] = useState('');
  const [experience, setExperience] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [loading, setLoading] = useState(true);

  // Load data based on active tab & filters
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'DIRECT') {
        if (isAuthenticated) {
          const res = await jobAPI.getDirectMatches({ search, experience });
          setDirectJobs(res.data.jobs || []);
        }
      } else if (activeTab === 'MULTI_HOP') {
        if (isAuthenticated) {
          const res = await jobAPI.getRelatedMatches({});
          setRelatedJobs(res.data.jobs || []);
        }
      } else if (activeTab === 'SKILL_GAP') {
        if (isAuthenticated) {
          const res = await jobAPI.getSkillGap();
          setSkillGaps(res.data.recommendations || []);
        }
      } else {
        const res = await jobAPI.getJobs({ search, experience, sortBy, page: pagination.page, limit: 9 });
        setAllJobs(res.data.jobs || []);
        setPagination(res.data.pagination || { total: 0, page: 1, totalPages: 1 });
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, search, experience, sortBy, pagination.page, user]);

  const handleAddGapSkill = async (skillName) => {
    if (!user) return;
    const currentSkills = user.skills?.map(s => typeof s === 'string' ? s : s.name) || [];
    if (!currentSkills.includes(skillName)) {
      const updated = [...currentSkills, skillName];
      await updateUserSkills(updated);
      fetchData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950/40 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Graph Opportunity Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAuthenticated ? (
              <span>Matching for <span className="text-blue-400 font-semibold">{user.name}</span> ({user.skills?.length || 0} active skills in knowledge graph)</span>
            ) : (
              <span>Log in or select a demo profile to see your personalized 1-hop and multi-hop graph matches.</span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/skills"
            className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Manage Skills</span>
          </Link>
          <Link
            to="/graph"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Visual Graph</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('DIRECT')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'DIRECT'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Direct Matches (1-Hop)</span>
        </button>

        <button
          onClick={() => setActiveTab('MULTI_HOP')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'MULTI_HOP'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
          }`}
        >
          <Route className="w-4 h-4 text-purple-300" />
          <span>Related Matches (Multi-Hop Proof)</span>
        </button>

        <button
          onClick={() => setActiveTab('SKILL_GAP')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'SKILL_GAP'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
          }`}
        >
          <Unlock className="w-4 h-4 text-amber-300" />
          <span>High-Leverage Skill Gap</span>
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'ALL'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>All Opportunities</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, company, or keyword..."
            className="w-full bg-slate-850 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">All Experience Levels</option>
            <option value="Junior">Junior</option>
            <option value="Mid-Level">Mid-Level</option>
            <option value="Senior">Senior</option>
            <option value="Staff / Lead">Staff / Lead</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="latest">Sort: Latest Added</option>
            <option value="title">Sort: Job Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-sm font-mono">Executing openCypher traversal on CognoDB...</span>
        </div>
      ) : activeTab === 'SKILL_GAP' ? (
        /* SKILL GAP VIEW */
        <div className="space-y-6">
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-5 text-amber-200 text-xs sm:text-sm">
            <h3 className="font-bold flex items-center space-x-2 text-amber-300 text-base mb-1">
              <Unlock className="w-4 h-4 text-amber-400" />
              <span>High-Leverage Career Bridges</span>
            </h3>
            <p className="text-slate-300 text-xs">
              Based on the jobs in the graph that you do not yet match, our graph traversal algorithm calculated which single skills unlock the highest number of new job postings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skillGaps.map((gap, idx) => (
              <div key={idx} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/50 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      +{gap.unlockedJobs} New Jobs
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{gap.domain}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1 font-mono">{gap.skill}</h4>
                  <p className="text-xs text-slate-400 mb-3">{gap.description}</p>

                  <div className="bg-slate-900/60 rounded-xl p-2.5 mb-4 border border-slate-800 text-[11px]">
                    <div className="text-slate-400 font-semibold mb-1">Unlocks roles like:</div>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                      {gap.sampleJobs?.map((title, i) => (
                        <li key={i} className="truncate">{title}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => handleAddGapSkill(gap.skill)}
                  className="w-full py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add "{gap.skill}" to Profile & Re-Match</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'DIRECT' ? (
        /* DIRECT MATCH VIEW */
        <div>
          {directJobs.length === 0 ? (
            <div className="bg-slate-850 rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
              <p className="text-base font-semibold text-slate-300 mb-1">No direct 1-hop matches found</p>
              <p className="text-xs mb-4">Try adding more skills in the Skill Studio or check the Related Matches tab for multi-hop graph bridges!</p>
              <Link to="/skills" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl inline-block">
                Go to Skill Studio
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {directJobs.map(job => (
                <JobCard key={job.id} job={job} mode="DIRECT" />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'MULTI_HOP' ? (
        /* MULTI-HOP VIEW */
        <div>
          <div className="mb-6 bg-purple-950/20 border border-purple-800/40 rounded-2xl p-4 text-xs text-purple-300 flex items-center space-x-3">
            <Route className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <span>
              <strong>The Multi-Hop Graph Proof:</strong> These jobs require skills you don't directly have, but your skills connect to them via semantic graph relationships (<code className="font-mono">:RELATED_TO</code>, <code className="font-mono">:SUB_SKILL_OF</code>).
            </span>
          </div>

          {relatedJobs.length === 0 ? (
            <div className="bg-slate-850 rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
              <p className="text-base font-semibold text-slate-300 mb-1">No multi-hop related matches found</p>
              <p className="text-xs">Add skills to your profile to let openCypher discover transitive graph bridges.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedJobs.map(job => (
                <JobCard key={job.id} job={job} mode="MULTI_HOP" />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ALL JOBS VIEW */
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allJobs.map(job => (
              <JobCard key={job.id} job={job} mode="STANDARD" />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6 border-t border-slate-800">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setPagination(p => ({ ...p, page }))}
                  className={`w-9 h-9 rounded-xl text-xs font-semibold transition-colors ${
                    pagination.page === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
