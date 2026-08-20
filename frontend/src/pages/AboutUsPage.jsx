import React from 'react';
import { 
  Database, 
  GitFork, 
  Zap, 
  Layers, 
  Terminal, 
  CheckCircle2, 
  ShieldCheck, 
  Code2, 
  Cpu 
} from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/30">
          <Database className="w-3.5 h-3.5" />
          <span>Wexa AI Take-Home Submission Architecture</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Why a Graph Database?
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          How native graph data modeling, openCypher traversals, and CognoDB Cloud elevate career intelligence far beyond relational SQL schemas.
        </p>
      </div>

      {/* Core "Why a Graph DB" Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="text-xl font-bold text-white">Index-Free Adjacency vs SQL Joins</h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            In a relational SQL database, matching a candidate to a job across direct skills, related sub-skills, domain categories, and company preferences requires traversing 5+ junction tables (<code className="text-blue-400">user_skills</code> &rarr; <code className="text-blue-400">skills</code> &rarr; <code className="text-blue-400">skill_relations</code> &rarr; <code className="text-blue-400">job_skills</code> &rarr; <code className="text-blue-400">jobs</code>).
          </p>
          <p className="text-slate-300 text-xs leading-relaxed">
            In <strong>CognoDB / openCypher</strong>, relationships are stored as direct physical memory pointers (index-free adjacency), making multi-hop traversals execute in (O(k)) time relative to the subgraph size, regardless of overall database size.
          </p>
        </div>

        <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="text-xl font-bold text-white">Transitive Ontology & Multi-Hop Proof</h3>
          <p className="text-slate-300 text-xs leading-relaxed">
            Skill sets form an interconnected semantic knowledge graph. A candidate skilled in <em>Docker</em> is inherently adjacent to <em>Kubernetes</em> and <em>Terraform</em>.
          </p>
          <p className="text-slate-300 text-xs leading-relaxed">
            Using variable length path pattern matching (<code className="text-purple-300 font-mono">[:RELATED_TO|SUB_SKILL_OF*1..2]</code>), openCypher traverses these bridges intuitively in a single declarative query and returns the exact path proof.
          </p>
        </div>
      </div>

      {/* Graph Schema Diagram */}
      <div className="bg-slate-850 border border-slate-700/80 rounded-3xl p-8 shadow-xl space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-blue-400" />
          <span>Graph Data Model & Relationships</span>
        </h3>
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 space-y-3">
          <div className="text-emerald-400 font-bold">// Node Labels:</div>
          <div>(:User &#123;id, name, email, passwordHash, title, experienceYears&#125;)</div>
          <div>(:Skill &#123;name, category, description&#125;)</div>
          <div>(:Job &#123;id, title, location, type, experienceLevel, salaryRange, description, createdAt&#125;)</div>
          <div>(:Domain &#123;name, category&#125;)</div>
          <div>(:Company &#123;name, industry, location&#125;)</div>
          
          <div className="text-blue-400 font-bold pt-3">// Relationship Types:</div>
          <div>(:User)-[:HAS_SKILL &#123;proficiency, addedAt&#125;]-&gt;(:Skill)</div>
          <div>(:Job)-[:REQUIRES_SKILL &#123;importance&#125;]-&gt;(:Skill)</div>
          <div>(:Job)-[:POSTED_BY]-&gt;(:Company)</div>
          <div>(:Skill)-[:RELATED_TO &#123;weight&#125;]-&gt;(:Skill)</div>
          <div>(:Skill)-[:SUB_SKILL_OF &#123;weight&#125;]-&gt;(:Skill)</div>
          <div>(:Skill)-[:BELONGS_TO]-&gt;(:Domain)</div>
        </div>
      </div>

      {/* Main Cypher Queries Explained */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-purple-400" />
          <span>Core Cypher Queries Explained</span>
        </h3>

        {/* Query 1 */}
        <div className="bg-slate-850 border border-slate-700/80 rounded-2xl p-6 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
            1. Multi-Hop Transitive Related Matches (2+ Hops)
          </div>
          <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-purple-300 overflow-x-auto border border-slate-800 leading-relaxed">
{`MATCH (u:User {id: $userId})-[:HAS_SKILL]->(userSkill:Skill)
MATCH path = (userSkill)-[:RELATED_TO|SUB_SKILL_OF*1..2]-(reqSkill:Skill)<-[:REQUIRES_SKILL]-(j:Job)
WHERE NOT (u)-[:HAS_SKILL]->(reqSkill)
RETURN j, userSkill.name AS yourSkill, reqSkill.name AS requiredSkill, length(path) AS hops`}
          </pre>
        </div>

        {/* Query 2 */}
        <div className="bg-slate-850 border border-slate-700/80 rounded-2xl p-6 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
            2. High-Leverage Skill Gap Analysis (Awkward for SQL)
          </div>
          <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-amber-300 overflow-x-auto border border-slate-800 leading-relaxed">
{`MATCH (u:User {id: $userId})
MATCH (targetJob:Job)-[:REQUIRES_SKILL]->(missingSkill:Skill)
WHERE NOT (u)-[:HAS_SKILL]->(missingSkill)
WITH missingSkill, count(DISTINCT targetJob) AS unlockedJobCount
RETURN missingSkill.name, unlockedJobCount
ORDER BY unlockedJobCount DESC LIMIT 5`}
          </pre>
        </div>
      </div>
    </div>
  );
}
