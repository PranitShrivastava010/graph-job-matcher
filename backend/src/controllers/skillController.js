const { runQuery } = require('../config/db');

class SkillController {
  static async getAllSkills(req, res) {
    try {
      const cypher = `
        MATCH (s:Skill)
        OPTIONAL MATCH (s)-[:BELONGS_TO]->(d:Domain)
        OPTIONAL MATCH (s)-[r:RELATED_TO|SUB_SKILL_OF]-(neighbor:Skill)
        WITH s, d, collect(DISTINCT { name: neighbor.name, rel: type(r) }) AS connections
        RETURN {
          name: s.name,
          category: s.category,
          domain: d.name,
          description: s.description,
          connections: connections
        } AS skill
        ORDER BY skill.domain, skill.name
      `;

      const results = await runQuery(cypher);
      return res.json({ success: true, skills: results.map(r => r.skill) });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateUserSkills(req, res) {
    try {
      const userId = req.user.id;
      const { skills } = req.body; // Array of skill names

      if (!Array.isArray(skills)) {
        return res.status(400).json({ success: false, message: 'Skills must be an array of skill names.' });
      }

      // Remove existing relationships
      await runQuery(
        `MATCH (u:User {id: $userId})-[r:HAS_SKILL]->() DELETE r`,
        { userId },
        'WRITE'
      );

      // Add new relationships
      for (const skillName of skills) {
        await runQuery(
          `MATCH (u:User {id: $userId}), (s:Skill {name: $skillName})
           MERGE (u)-[:HAS_SKILL {proficiency: 'Proficient', addedAt: datetime()}]->(s)`,
          { userId, skillName },
          'WRITE'
        );
      }

      return res.json({ success: true, message: 'Skills updated successfully', skills });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = SkillController;
