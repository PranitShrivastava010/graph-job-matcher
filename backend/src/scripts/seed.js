const { runQuery, driver } = require('../config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Starting CognoDB Graph Seed...');

  try {
    // 1. Clear existing nodes and relationships
    console.log('🧹 Clearing existing data in CognoDB...');
    await runQuery('MATCH (n) DETACH DELETE n', {}, 'WRITE');

    // 2. Create Domains
    console.log('📂 Creating Knowledge Domains...');
    const domains = [
      { name: 'Frontend Engineering', category: 'Engineering' },
      { name: 'Backend Engineering', category: 'Engineering' },
      { name: 'Cloud & DevOps', category: 'Infrastructure' },
      { name: 'AI & Data Science', category: 'Intelligence' },
      { name: 'Graph Technologies', category: 'Database Systems' },
      { name: 'Mobile Development', category: 'Client Platforms' }
    ];

    for (const d of domains) {
      await runQuery(
        `MERGE (d:Domain {name: $name})
         SET d.category = $category`,
        d,
        'WRITE'
      );
    }

    // 3. Create Skills
    console.log('🧠 Creating Skills & Categories...');
    const skills = [
      { name: 'React', category: 'Frontend', domain: 'Frontend Engineering', desc: 'Declarative component-based UI library' },
      { name: 'Next.js', category: 'Frontend', domain: 'Frontend Engineering', desc: 'React full-stack production framework' },
      { name: 'TypeScript', category: 'Languages', domain: 'Frontend Engineering', desc: 'Typed superset of JavaScript' },
      { name: 'JavaScript', category: 'Languages', domain: 'Frontend Engineering', desc: 'High-level dynamic scripting language' },
      { name: 'Tailwind CSS', category: 'Frontend', domain: 'Frontend Engineering', desc: 'Utility-first modern CSS framework' },
      { name: 'HTML/CSS', category: 'Frontend', domain: 'Frontend Engineering', desc: 'Core web markup and style standards' },
      { name: 'GraphQL', category: 'API', domain: 'Backend Engineering', desc: 'Data query and manipulation language for APIs' },
      { name: 'REST APIs', category: 'API', domain: 'Backend Engineering', desc: 'Representational State Transfer API architecture' },
      
      { name: 'Node.js', category: 'Backend', domain: 'Backend Engineering', desc: 'Chrome V8 asynchronous JS runtime' },
      { name: 'Express', category: 'Backend', domain: 'Backend Engineering', desc: 'Fast, unopinionated minimalist Node web framework' },
      { name: 'PostgreSQL', category: 'Databases', domain: 'Backend Engineering', desc: 'Advanced open-source relational SQL database' },
      { name: 'Redis', category: 'Databases', domain: 'Backend Engineering', desc: 'In-memory key-value data structure store' },
      { name: 'System Design', category: 'Architecture', domain: 'Backend Engineering', desc: 'Designing scalable distributed systems' },
      { name: 'Microservices', category: 'Architecture', domain: 'Backend Engineering', desc: 'Decoupled service-oriented architecture' },

      { name: 'Docker', category: 'DevOps', domain: 'Cloud & DevOps', desc: 'Containerization and OS-level virtualization' },
      { name: 'Kubernetes', category: 'DevOps', domain: 'Cloud & DevOps', desc: 'Automated container orchestration and scaling' },
      { name: 'AWS', category: 'Cloud', domain: 'Cloud & DevOps', desc: 'Amazon Web Services cloud platform' },
      { name: 'Terraform', category: 'DevOps', domain: 'Cloud & DevOps', desc: 'Infrastructure as code provisioning tool' },
      { name: 'CI/CD', category: 'DevOps', domain: 'Cloud & DevOps', desc: 'Continuous Integration & Continuous Delivery' },
      { name: 'GitHub Actions', category: 'DevOps', domain: 'Cloud & DevOps', desc: 'Workflow automation and CI pipelines' },

      { name: 'Python', category: 'Languages', domain: 'AI & Data Science', desc: 'Versatile language for AI, data, and web' },
      { name: 'FastAPI', category: 'Backend', domain: 'AI & Data Science', desc: 'High-performance Python async API framework' },
      { name: 'PyTorch', category: 'AI/ML', domain: 'AI & Data Science', desc: 'Deep learning framework for neural networks' },
      { name: 'Machine Learning', category: 'AI/ML', domain: 'AI & Data Science', desc: 'Algorithms learning from empirical data' },
      { name: 'LLM Engineering', category: 'AI/ML', domain: 'AI & Data Science', desc: 'Large language model fine-tuning & prompt systems' },
      { name: 'LangChain', category: 'AI/ML', domain: 'AI & Data Science', desc: 'Framework for developing applications powered by LLMs' },

      { name: 'CognoDB / Neo4j', category: 'Graph', domain: 'Graph Technologies', desc: 'Native graph database using openCypher / Bolt' },
      { name: 'Graph Databases', category: 'Graph', domain: 'Graph Technologies', desc: 'Node-relationship first-class graph models' },
      { name: 'Knowledge Graphs', category: 'Graph', domain: 'Graph Technologies', desc: 'Structured semantic interconnected ontologies' },
      { name: 'Cypher Query Language', category: 'Graph', domain: 'Graph Technologies', desc: 'Declarative graph query language for pattern matching' },

      { name: 'React Native', category: 'Mobile', domain: 'Mobile Development', desc: 'Cross-platform native mobile framework' },
      { name: 'Flutter', category: 'Mobile', domain: 'Mobile Development', desc: 'Google UI toolkit for natively compiled mobile apps' }
    ];

    for (const s of skills) {
      await runQuery(
        `MERGE (s:Skill {name: $name})
         SET s.category = $category, s.description = $desc
         WITH s
         MATCH (d:Domain {name: $domain})
         MERGE (s)-[:BELONGS_TO]->(d)`,
        s,
        'WRITE'
      );
    }

    // 4. Create Ontological Skill Relationships (RELATED_TO, SUB_SKILL_OF)
    console.log('🔗 Creating Skill Graph Edges (Ontology)...');
    const skillEdges = [
      // Subskills
      { from: 'Next.js', to: 'React', type: 'SUB_SKILL_OF', weight: 1.0 },
      { from: 'React Native', to: 'React', type: 'SUB_SKILL_OF', weight: 0.9 },
      { from: 'Express', to: 'Node.js', type: 'SUB_SKILL_OF', weight: 0.95 },
      { from: 'GitHub Actions', to: 'CI/CD', type: 'SUB_SKILL_OF', weight: 0.9 },
      { from: 'LangChain', to: 'LLM Engineering', type: 'SUB_SKILL_OF', weight: 0.9 },
      { from: 'CognoDB / Neo4j', to: 'Graph Databases', type: 'SUB_SKILL_OF', weight: 1.0 },
      { from: 'Cypher Query Language', to: 'Graph Databases', type: 'SUB_SKILL_OF', weight: 0.95 },
      { from: 'Tailwind CSS', to: 'HTML/CSS', type: 'SUB_SKILL_OF', weight: 0.9 },

      // Related
      { from: 'React', to: 'TypeScript', type: 'RELATED_TO', weight: 0.9 },
      { from: 'JavaScript', to: 'TypeScript', type: 'RELATED_TO', weight: 0.95 },
      { from: 'TypeScript', to: 'Node.js', type: 'RELATED_TO', weight: 0.88 },
      { from: 'Node.js', to: 'PostgreSQL', type: 'RELATED_TO', weight: 0.85 },
      { from: 'Node.js', to: 'Redis', type: 'RELATED_TO', weight: 0.85 },
      { from: 'Docker', to: 'Kubernetes', type: 'RELATED_TO', weight: 0.92 },
      { from: 'Kubernetes', to: 'AWS', type: 'RELATED_TO', weight: 0.88 },
      { from: 'Docker', to: 'AWS', type: 'RELATED_TO', weight: 0.85 },
      { from: 'Terraform', to: 'AWS', type: 'RELATED_TO', weight: 0.9 },
      { from: 'CI/CD', to: 'Docker', type: 'RELATED_TO', weight: 0.85 },
      { from: 'Python', to: 'FastAPI', type: 'RELATED_TO', weight: 0.92 },
      { from: 'Python', to: 'PyTorch', type: 'RELATED_TO', weight: 0.94 },
      { from: 'PyTorch', to: 'Machine Learning', type: 'RELATED_TO', weight: 0.95 },
      { from: 'Machine Learning', to: 'LLM Engineering', type: 'RELATED_TO', weight: 0.92 },
      { from: 'Graph Databases', to: 'Knowledge Graphs', type: 'RELATED_TO', weight: 0.9 },
      { from: 'LLM Engineering', to: 'Knowledge Graphs', type: 'RELATED_TO', weight: 0.88 },
      { from: 'System Design', to: 'Microservices', type: 'RELATED_TO', weight: 0.92 },
      { from: 'Microservices', to: 'Docker', type: 'RELATED_TO', weight: 0.88 },
      { from: 'GraphQL', to: 'REST APIs', type: 'RELATED_TO', weight: 0.85 },
      { from: 'React', to: 'GraphQL', type: 'RELATED_TO', weight: 0.82 }
    ];

    for (const edge of skillEdges) {
      if (edge.type === 'SUB_SKILL_OF') {
        await runQuery(
          `MATCH (a:Skill {name: $from}), (b:Skill {name: $to})
           MERGE (a)-[:SUB_SKILL_OF {weight: $weight}]->(b)`,
          edge,
          'WRITE'
        );
      } else {
        await runQuery(
          `MATCH (a:Skill {name: $from}), (b:Skill {name: $to})
           MERGE (a)-[:RELATED_TO {weight: $weight}]->(b)
           MERGE (b)-[:RELATED_TO {weight: $weight}]->(a)`,
          edge,
          'WRITE'
        );
      }
    }

    // 5. Create Companies
    console.log('🏢 Creating Companies...');
    const companies = [
      { name: 'Wexa AI', industry: 'Artificial Intelligence', location: 'San Francisco, CA & Remote' },
      { name: 'Vercel', industry: 'Cloud & Developer Tooling', location: 'Remote / Global' },
      { name: 'Linear', industry: 'Productivity Software', location: 'San Francisco, CA' },
      { name: 'Datadog', industry: 'Cloud Monitoring & DevOps', location: 'New York, NY' },
      { name: 'Stripe', industry: 'Fintech & Payments', location: 'San Francisco & Remote' },
      { name: 'Anthropic', industry: 'AI Safety & Research', location: 'San Francisco, CA' },
      { name: 'Spotify', industry: 'Audio Streaming & Mobile', location: 'Stockholm & Remote' },
      { name: 'Figma', industry: 'Collaborative Design Systems', location: 'San Francisco, CA' },
      { name: 'Scale AI', industry: 'AI Data Infrastructure', location: 'San Francisco, CA' }
    ];

    for (const c of companies) {
      await runQuery(
        `MERGE (c:Company {name: $name})
         SET c.industry = $industry, c.location = $location`,
        c,
        'WRITE'
      );
    }

    // 6. Create Realistic Jobs
    console.log('💼 Creating Jobs & Skill Requirements...');
    const jobs = [
      {
        id: 'job-1',
        title: 'Lead AI & Graph Platform Engineer',
        company: 'Wexa AI',
        location: 'Remote',
        type: 'Full-time',
        experienceLevel: 'Senior',
        salaryRange: '$160,000 - $210,000',
        createdAt: '2026-08-19T10:00:00Z',
        description: 'Architect next-generation enterprise knowledge graph systems, AI agent routing, and graph retrieval augmented generation (Graph RAG) with openCypher and Python.',
        skills: ['CognoDB / Neo4j', 'Knowledge Graphs', 'Python', 'FastAPI', 'LLM Engineering']
      },
      {
        id: 'job-2',
        title: 'Senior Frontend Systems Architect',
        company: 'Vercel',
        location: 'Remote',
        type: 'Full-time',
        experienceLevel: 'Senior',
        salaryRange: '$170,000 - $220,000',
        createdAt: '2026-08-18T14:30:00Z',
        description: 'Build hyper-performant server-rendered web applications with Next.js, React compiler, and advanced TypeScript component architectures.',
        skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL']
      },
      {
        id: 'job-3',
        title: 'Cloud Infrastructure & Kubernetes Engineer',
        company: 'Datadog',
        location: 'New York / Hybrid',
        type: 'Full-time',
        experienceLevel: 'Mid-Senior',
        salaryRange: '$145,000 - $185,000',
        createdAt: '2026-08-17T09:15:00Z',
        description: 'Scale multi-region Kubernetes clusters handling petabytes of real-time telemetry metrics using Terraform and AWS infrastructure.',
        skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD']
      },
      {
        id: 'job-4',
        title: 'Full Stack Node & React Product Engineer',
        company: 'Linear',
        location: 'San Francisco / Remote',
        type: 'Full-time',
        experienceLevel: 'Mid-Level',
        salaryRange: '$140,000 - $180,000',
        createdAt: '2026-08-16T11:00:00Z',
        description: 'Craft lightning-fast, offline-first collaborative user experiences with React, Node.js microservices, and PostgreSQL database synchronization.',
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis']
      },
      {
        id: 'job-5',
        title: 'Distributed Core Backend Engineer',
        company: 'Stripe',
        location: 'San Francisco, CA',
        type: 'Full-time',
        experienceLevel: 'Senior',
        salaryRange: '$180,000 - $240,000',
        createdAt: '2026-08-15T08:00:00Z',
        description: 'Design zero-downtime, fault-tolerant financial ledger APIs and transactional payment orchestrations across distributed services.',
        skills: ['Node.js', 'Express', 'System Design', 'Microservices', 'PostgreSQL', 'Redis']
      },
      {
        id: 'job-6',
        title: 'LLM Alignment & Agent Engineer',
        company: 'Anthropic',
        location: 'San Francisco, CA',
        type: 'Full-time',
        experienceLevel: 'Senior',
        salaryRange: '$190,000 - $260,000',
        createdAt: '2026-08-14T16:00:00Z',
        description: 'Develop state-of-the-art model tool use, multi-hop reasoning agents, and automated safety evaluation harnesses.',
        skills: ['Python', 'PyTorch', 'LLM Engineering', 'LangChain', 'Machine Learning']
      },
      {
        id: 'job-7',
        title: 'Cross-Platform Mobile Engineer',
        company: 'Spotify',
        location: 'Remote',
        type: 'Full-time',
        experienceLevel: 'Mid-Senior',
        salaryRange: '$135,000 - $175,000',
        createdAt: '2026-08-13T12:00:00Z',
        description: 'Deliver seamless audio playback, offline caching, and responsive gesture-driven UI for millions of active mobile listeners.',
        skills: ['React Native', 'React', 'TypeScript', 'REST APIs', 'GraphQL']
      },
      {
        id: 'job-8',
        title: 'Design Systems & Canvas Engineer',
        company: 'Figma',
        location: 'San Francisco, CA',
        type: 'Full-time',
        experienceLevel: 'Senior',
        salaryRange: '$175,000 - $230,000',
        createdAt: '2026-08-12T10:30:00Z',
        description: 'Innovate on multiplayer canvas rendering, tokens, typography engines, and high-performance TypeScript web primitives.',
        skills: ['React', 'TypeScript', 'HTML/CSS', 'System Design', 'Tailwind CSS']
      },
      {
        id: 'job-9',
        title: 'Graph Data & ML Infrastructure Specialist',
        company: 'Scale AI',
        location: 'Remote / US',
        type: 'Full-time',
        experienceLevel: 'Senior',
        salaryRange: '$165,000 - $215,000',
        createdAt: '2026-08-11T09:00:00Z',
        description: 'Scale semantic data pipelines connecting multimodal training datasets, knowledge graph entity linking, and cloud pipelines.',
        skills: ['Graph Databases', 'Python', 'FastAPI', 'Docker', 'AWS']
      },
      {
        id: 'job-10',
        title: 'Junior Web & Frontend Developer',
        company: 'Vercel',
        location: 'Remote',
        type: 'Full-time',
        experienceLevel: 'Junior',
        salaryRange: '$85,000 - $115,000',
        createdAt: '2026-08-10T14:00:00Z',
        description: 'Join the developer community team building starter templates, interactive docs, and testing modern web UI components.',
        skills: ['JavaScript', 'HTML/CSS', 'React', 'Tailwind CSS']
      },
      {
        id: 'job-11',
        title: 'Site Reliability & DevOps Automation Lead',
        company: 'Stripe',
        location: 'Seattle, WA / Remote',
        type: 'Full-time',
        experienceLevel: 'Staff / Lead',
        salaryRange: '$195,000 - $265,000',
        createdAt: '2026-08-09T11:45:00Z',
        description: 'Drive reliability engineering, CI/CD automation pipelines, GitOps with Kubernetes and multi-cloud provisioning.',
        skills: ['Kubernetes', 'Docker', 'CI/CD', 'GitHub Actions', 'Terraform', 'System Design']
      },
      {
        id: 'job-12',
        title: 'AI Workflow & Knowledge Integration Engineer',
        company: 'Wexa AI',
        location: 'San Francisco, CA / Remote',
        type: 'Full-time',
        experienceLevel: 'Mid-Level',
        salaryRange: '$130,000 - $170,000',
        createdAt: '2026-08-08T15:20:00Z',
        description: 'Build user-facing agentic workflows, connecting CognoDB graphs to conversational UI assistants and structured tool execution.',
        skills: ['Python', 'CognoDB / Neo4j', 'FastAPI', 'React', 'REST APIs']
      }
    ];

    for (const job of jobs) {
      await runQuery(
        `MERGE (j:Job {id: $id})
         SET j.title = $title,
             j.location = $location,
             j.type = $type,
             j.experienceLevel = $experienceLevel,
             j.salaryRange = $salaryRange,
             j.createdAt = $createdAt,
             j.description = $description
         WITH j
         MATCH (c:Company {name: $company})
         MERGE (j)-[:POSTED_BY]->(c)`,
        job,
        'WRITE'
      );

      for (const skillName of job.skills) {
        await runQuery(
          `MATCH (j:Job {id: $jobId}), (s:Skill {name: $skillName})
           MERGE (j)-[:REQUIRES_SKILL {importance: 'Required'}]->(s)`,
          { jobId: job.id, skillName },
          'WRITE'
        );
      }
    }

    // 7. Create Demo Users & Skill Profiles
    console.log('👤 Creating Demo Users with Pre-Configured Skill Graphs...');
    const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

    const demoUsers = [
      {
        id: 'user-frontend-1',
        name: 'Alex Rivera',
        email: 'alex.frontend@wexa.ai',
        title: 'Senior Frontend Engineer',
        experienceYears: 6,
        skills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'HTML/CSS']
      },
      {
        id: 'user-devops-1',
        name: 'Jordan Chen',
        email: 'jordan.devops@wexa.ai',
        title: 'Cloud & Infrastructure Engineer',
        experienceYears: 5,
        skills: ['Docker', 'AWS', 'CI/CD', 'GitHub Actions', 'Terraform']
      },
      {
        id: 'user-ai-1',
        name: 'Dr. Elena Rostova',
        email: 'elena.ai@wexa.ai',
        title: 'AI & Knowledge Graph Researcher',
        experienceYears: 7,
        skills: ['Python', 'FastAPI', 'Machine Learning', 'PyTorch', 'CognoDB / Neo4j']
      },
      {
        id: 'user-junior-1',
        name: 'Sam Taylor',
        email: 'sam.junior@wexa.ai',
        title: 'Junior Full Stack Enthusiast',
        experienceYears: 1,
        skills: ['JavaScript', 'HTML/CSS', 'React', 'Node.js']
      }
    ];

    for (const u of demoUsers) {
      await runQuery(
        `MERGE (u:User {email: $email})
         SET u.id = $id,
             u.name = $name,
             u.passwordHash = $passwordHash,
             u.title = $title,
             u.experienceYears = $experienceYears,
             u.createdAt = datetime()
        `,
        { ...u, passwordHash: defaultPasswordHash },
        'WRITE'
      );

      for (const skillName of u.skills) {
        await runQuery(
          `MATCH (u:User {email: $email}), (s:Skill {name: $skillName})
           MERGE (u)-[:HAS_SKILL {proficiency: 'Proficient', addedAt: datetime()}]->(s)`,
          { email: u.email, skillName },
          'WRITE'
        );
      }
    }

    console.log('✨ Seed completed successfully!');
    const stats = await runQuery(`
      MATCH (j:Job) WITH count(j) as jobCount
      MATCH (s:Skill) WITH jobCount, count(s) as skillCount
      MATCH (u:User) WITH jobCount, skillCount, count(u) as userCount
      MATCH ()-[r]->() WITH jobCount, skillCount, userCount, count(r) as relCount
      RETURN jobCount, skillCount, userCount, relCount
    `);
    console.log('📊 Graph Database Stats:', stats[0]);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await driver.close();
    process.exit(0);
  }
}

seed();
