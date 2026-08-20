const { runQuery } = require('../config/db');

class CypherService {
  /**
   * 1-Hop Traversal: Direct Matches
   * Finds jobs that directly require skills the user possesses.
   */
  static async getDirectJobMatches(userId, { search = '', experience = '', limit = 20, skip = 0 }) {
    const cypher = `
      MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)
      WITH u, collect(s.name) AS userSkillNames
      MATCH (j:Job)-[:REQUIRES_SKILL]->(req:Skill)
      WHERE ($search = '' OR toLower(j.title) CONTAINS toLower($search) OR toLower(j.description) CONTAINS toLower($search))
        AND ($experience = '' OR j.experienceLevel = $experience)
      OPTIONAL MATCH (u)-[:HAS_SKILL]->(userSkill:Skill)
      WHERE (j)-[:REQUIRES_SKILL]->(userSkill)
      WITH j, 
           count(DISTINCT req) AS totalRequired, 
           collect(DISTINCT req.name) AS requiredSkillList,
           collect(DISTINCT userSkill.name) AS matchedSkills
      WHERE size(matchedSkills) > 0
      MATCH (j)-[:POSTED_BY]->(c:Company)
      WITH j, c, totalRequired, requiredSkillList, matchedSkills,
           round((toFloat(size(matchedSkills)) / totalRequired) * 100) AS matchPercentage
      RETURN {
        id: j.id,
        title: j.title,
        location: j.location,
        type: j.type,
        experienceLevel: j.experienceLevel,
        salaryRange: j.salaryRange,
        description: j.description,
        createdAt: j.createdAt,
        company: {
          name: c.name,
          industry: c.industry,
          location: c.location
        },
        totalRequired: totalRequired,
        requiredSkills: requiredSkillList,
        matchedSkills: matchedSkills,
        missingSkills: [x IN requiredSkillList WHERE NOT x IN matchedSkills],
        matchPercentage: matchPercentage,
        matchType: 'DIRECT'
      } AS job
      ORDER BY job.matchPercentage DESC, job.createdAt DESC
      SKIP toInteger($skip)
      LIMIT toInteger($limit)
    `;

    const results = await runQuery(cypher, { userId, search, experience, limit, skip });
    return results.map(r => r.job);
  }

  /**
   * Multi-Hop Traversal (2-3 Hops) - The Graph Proof!
   * Discovers jobs where the candidate's skills connect transitively through
   * [:RELATED_TO] or [:SUB_SKILL_OF] ontology relationships.
   */
  static async getRelatedMultiHopMatches(userId, { limit = 20, skip = 0 }) {
    const cypher = `
      MATCH (u:User {id: $userId})-[:HAS_SKILL]->(s:Skill)
      WITH u, collect(s.name) AS userSkillNames, collect(s) AS userSkills
      UNWIND userSkills AS userSkill
      MATCH path = (userSkill)-[:RELATED_TO|SUB_SKILL_OF*1..2]-(reqSkill:Skill)
      WHERE NOT reqSkill.name IN userSkillNames
      MATCH (j:Job)-[:REQUIRES_SKILL]->(reqSkill)
      MATCH (j)-[:POSTED_BY]->(c:Company)
      MATCH (j)-[:REQUIRES_SKILL]->(allReq:Skill)
      WITH j, c, userSkill, reqSkill, path,
           relationships(path) AS rels,
           [n IN nodes(path) | n.name] AS pathNodes,
           collect(DISTINCT allReq.name) AS allRequiredSkills
      WITH j, c, allRequiredSkills,
           collect(DISTINCT {
             yourSkill: userSkill.name,
             requiredSkill: reqSkill.name,
             hops: length(path),
             pathSummary: pathNodes,
             relationship: type(rels[0])
           }) AS graphBridges
      RETURN {
        id: j.id,
        title: j.title,
        location: j.location,
        type: j.type,
        experienceLevel: j.experienceLevel,
        salaryRange: j.salaryRange,
        description: j.description,
        createdAt: j.createdAt,
        company: {
          name: c.name,
          industry: c.industry,
          location: c.location
        },
        requiredSkills: allRequiredSkills,
        graphBridges: graphBridges,
        bridgeCount: size(graphBridges),
        matchType: 'MULTI_HOP_RELATED'
      } AS job
      ORDER BY job.bridgeCount DESC, job.createdAt DESC
      SKIP toInteger($skip)
      LIMIT toInteger($limit)
    `;

    const results = await runQuery(cypher, { userId, limit, skip });
    return results.map(r => r.job);
  }

  /**
   * Comprehensive Job Listing with Pagination, Search, Sorting
   */
  static async getJobs({ search = '', experience = '', company = '', sortBy = 'latest', page = 1, limit = 10, userId = null }) {
    const skip = (page - 1) * limit;

    const countCypher = `
      MATCH (j:Job)-[:POSTED_BY]->(c:Company)
      WHERE ($search = '' OR toLower(j.title) CONTAINS toLower($search) OR toLower(j.description) CONTAINS toLower($search) OR toLower(c.name) CONTAINS toLower($search))
        AND ($experience = '' OR j.experienceLevel = $experience)
        AND ($company = '' OR toLower(c.name) = toLower($company))
      RETURN count(j) AS total
    `;

    const listCypher = `
      MATCH (j:Job)-[:POSTED_BY]->(c:Company)
      MATCH (j)-[:REQUIRES_SKILL]->(s:Skill)
      WHERE ($search = '' OR toLower(j.title) CONTAINS toLower($search) OR toLower(j.description) CONTAINS toLower($search) OR toLower(c.name) CONTAINS toLower($search))
        AND ($experience = '' OR j.experienceLevel = $experience)
        AND ($company = '' OR toLower(c.name) = toLower($company))
      WITH j, c, collect(DISTINCT s.name) AS requiredSkills
      RETURN {
        id: j.id,
        title: j.title,
        location: j.location,
        type: j.type,
        experienceLevel: j.experienceLevel,
        salaryRange: j.salaryRange,
        description: j.description,
        createdAt: j.createdAt,
        company: {
          name: c.name,
          industry: c.industry,
          location: c.location
        },
        requiredSkills: requiredSkills
      } AS job
      ORDER BY ${sortBy === 'latest' ? 'job.createdAt DESC' : 'job.title ASC'}
      SKIP toInteger($skip)
      LIMIT toInteger($limit)
    `;

    const [countRes, listRes] = await Promise.all([
      runQuery(countCypher, { search, experience, company }),
      runQuery(listCypher, { search, experience, company, skip, limit })
    ]);

    const total = countRes[0]?.total || 0;
    const jobs = listRes.map(r => r.job);

    return {
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single job details with required skills and candidates matching it
   */
  static async getJobById(jobId, userId = null) {
    const cypher = `
      MATCH (j:Job {id: $jobId})-[:POSTED_BY]->(c:Company)
      MATCH (j)-[:REQUIRES_SKILL]->(s:Skill)
      OPTIONAL MATCH (s)-[:BELONGS_TO]->(d:Domain)
      WITH j, c, collect(DISTINCT {
        name: s.name,
        category: s.category,
        domain: d.name,
        description: s.description
      }) AS skills
      RETURN {
        id: j.id,
        title: j.title,
        location: j.location,
        type: j.type,
        experienceLevel: j.experienceLevel,
        salaryRange: j.salaryRange,
        description: j.description,
        createdAt: j.createdAt,
        company: {
          name: c.name,
          industry: c.industry,
          location: c.location
        },
        skills: skills
      } AS job
    `;

    const results = await runQuery(cypher, { jobId });
    if (!results.length) return null;
    const job = results[0].job;

    if (userId) {
      const userMatchCypher = `
        MATCH (u:User {id: $userId})-[:HAS_SKILL]->(us:Skill)
        MATCH (j:Job {id: $jobId})-[:REQUIRES_SKILL]->(js:Skill)
        WHERE us = js
        RETURN collect(DISTINCT us.name) AS directSkills
      `;
      const directRes = await runQuery(userMatchCypher, { userId, jobId });
      job.userMatchedSkills = directRes[0]?.directSkills || [];
    }

    return job;
  }

  /**
   * Subgraph visualizer export
   */
  static async getGraphVisualizationData(userId = null) {
    const fullGraphCypher = `
      MATCH (n)
      WHERE n:Skill OR n:Job OR n:Company OR n:User
      WITH collect(DISTINCT n)[0..80] AS nodes
      MATCH (a)-[r]->(b)
      WHERE a IN nodes AND b IN nodes
      RETURN [node IN nodes | {
        id: coalesce(node.id, node.name),
        label: coalesce(node.title, node.name),
        type: labels(node)[0],
        properties: properties(node)
      }] AS nodes,
      [rel IN collect(DISTINCT r) | {
        source: coalesce(startNode(rel).id, startNode(rel).name),
        target: coalesce(endNode(rel).id, endNode(rel).name),
        type: type(rel),
        properties: properties(rel)
      }] AS edges
    `;

    const res = await runQuery(fullGraphCypher, {});
    return res[0] || { nodes: [], edges: [] };
  }

  /**
   * Skill Gap Analysis
   */
  static async getSkillGapRecommendations(userId) {
    const cypher = `
      MATCH (u:User {id: $userId})
      MATCH (targetJob:Job)-[:REQUIRES_SKILL]->(missingSkill:Skill)
      WHERE NOT (u)-[:HAS_SKILL]->(missingSkill)
      WITH missingSkill, count(DISTINCT targetJob) AS unlockedJobCount, collect(DISTINCT targetJob.title)[0..3] AS sampleJobTitles
      MATCH (missingSkill)-[:BELONGS_TO]->(d:Domain)
      RETURN {
        skill: missingSkill.name,
        category: missingSkill.category,
        domain: d.name,
        description: missingSkill.description,
        unlockedJobs: unlockedJobCount,
        sampleJobs: sampleJobTitles
      } AS recommendation
      ORDER BY recommendation.unlockedJobs DESC
      LIMIT 6
    `;

    const results = await runQuery(cypher, { userId });
    return results.map(r => r.recommendation);
  }
}

module.exports = CypherService;
