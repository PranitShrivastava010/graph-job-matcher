import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { skillAPI } from '../services/api';
import { 
  Sparkles, 
  Search, 
  Plus, 
  X, 
  Check, 
  Layers, 
  Briefcase, 
  TrendingUp,
  Save,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfileSkillsPage() {
  const { user, updateUserSkills, isAuthenticated } = useAuth();
  const [allSkills, setAllSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [userSkills, setUserSkills] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    skillAPI.getAllSkills().then(res => {
      setAllSkills(res.data.skills || []);
    });
  }, []);

  useEffect(() => {
    if (user?.skills) {
      const formatted = user.skills.map(s => typeof s === 'string' ? s : s.name);
      setUserSkills(formatted);
    }
  }, [user]);

  const domains = ['ALL', ...new Set(allSkills.map(s => s.domain).filter(Boolean))];

  const filteredSkills = allSkills.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
    const matchesDomain = selectedDomain === 'ALL' || s.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const toggleSkill = (skillName) => {
    if (userSkills.includes(skillName)) {
      setUserSkills(userSkills.filter(s => s !== skillName));
    } else {
      setUserSkills([...userSkills, skillName]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserSkills(userSkills);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <Sparkles className="w-7 h-7 text-blue-400" />
            <span>Skill Knowledge Graph Studio</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure your technical ontology. Adding nodes triggers live openCypher graph traversals across job requirements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Saved to CognoDB!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Syncing...' : 'Save Skill Graph'}</span>
              </>
            )}
          </button>

          <Link
            to="/jobs"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span>View Matches</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Active Skills List */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-850 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Your Active Skill Nodes ({userSkills.length})
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Live in Graph</span>
            </div>

            {userSkills.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No skills selected yet. Click skills on the right to attach them to your graph profile.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userSkills.map((skillName) => (
                  <span
                    key={skillName}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 group"
                  >
                    <span>{skillName}</span>
                    <button
                      onClick={() => toggleSkill(skillName)}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-purple-950/20 border border-purple-800/40 rounded-2xl p-5 text-xs text-purple-300 space-y-2">
            <h4 className="font-bold flex items-center space-x-1.5 text-purple-200 text-sm">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Multi-Hop Traversal Tip</span>
            </h4>
            <p className="leading-relaxed">
              When you select a skill like <span className="font-mono font-bold text-white">Docker</span>, our openCypher engine traverses its <code className="text-purple-300">:RELATED_TO</code> edges to match you with <span className="font-mono font-bold text-white">Kubernetes</span> and <span className="font-mono font-bold text-white">Terraform</span> jobs automatically!
            </p>
          </div>
        </div>

        {/* Right Column: Skill Catalog Explorer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-850 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5">
            {/* Search & Domain Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search available skills in graph..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {domains.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Skill Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredSkills.map((skill) => {
                const isSelected = userSkills.includes(skill.name);
                return (
                  <div
                    key={skill.name}
                    onClick={() => toggleSkill(skill.name)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500/60 shadow-sm'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-xs font-mono font-bold text-white">{skill.name}</span>
                        <span className="block text-[10px] text-slate-500 font-mono">{skill.category}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                        isSelected
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-slate-700 text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {skill.description}
                    </p>

                    {skill.connections && skill.connections.length > 0 && (
                      <div className="mt-2 text-[10px] text-slate-500 truncate font-mono">
                        Related: {skill.connections.slice(0, 2).map(c => c.name).join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
