import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Network, 
  Briefcase, 
  Sparkles, 
  Compass, 
  UserCheck, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Database,
  Info,
  ChevronDown,
  Layers
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, demoProfiles, loginAsDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">
                NexusGraph
              </span>
              <span className="block text-[10px] uppercase font-mono tracking-widest text-blue-400 -mt-1 font-semibold">
                CognoDB Cloud
              </span>
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/jobs"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/jobs')
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Jobs & Matches</span>
            </Link>

            <Link
              to="/skills"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/skills')
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Skill Studio</span>
            </Link>

            <Link
              to="/graph"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/graph')
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Visual Graph</span>
            </Link>

            <Link
              to="/about"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>About & Architecture</span>
            </Link>
          </nav>

          {/* Right Action Menu */}
          <div className="flex items-center space-x-3">
            {/* 1-Click Demo Profile Switcher for Evaluators */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/40 text-indigo-200 hover:border-indigo-400 transition-all shadow-sm"
                title="Switch test profiles to test multi-hop matching"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Demo Switcher</span>
                <ChevronDown className="w-3 h-3 text-indigo-400" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-slate-700 text-xs font-semibold text-slate-400">
                    ⚡ Instant Evaluator Profiles
                  </div>
                  {demoProfiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={async () => {
                        setShowDemoMenu(false);
                        await loginAsDemo(p.email);
                        navigate('/jobs');
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-700/60 transition-colors flex flex-col"
                    >
                      <span className="font-semibold text-slate-200">{p.name}</span>
                      <span className="text-[11px] text-blue-400">{p.title}</span>
                      <span className="text-[10px] text-slate-400 truncate">Skills: {p.skills?.slice(0, 3).join(', ')}...</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-semibold text-slate-200">{user.name}</div>
                  <div className="text-[10px] text-emerald-400 font-mono flex items-center justify-end space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Graph Connected</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log in</span>
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm flex items-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
