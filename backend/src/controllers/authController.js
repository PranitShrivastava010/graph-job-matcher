const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runQuery } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'cognodb_graph_jwt_secret_key_wexa_2026';

class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password, title = 'Software Engineer', experienceYears = 2, skills = [] } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      }

      const existing = await runQuery('MATCH (u:User {email: $email}) RETURN u.email AS email', { email });
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = 'user-' + Date.now();

      await runQuery(
        `MERGE (u:User {email: $email})
         SET u.id = $userId,
             u.name = $name,
             u.passwordHash = $passwordHash,
             u.title = $title,
             u.experienceYears = toInteger($experienceYears),
             u.createdAt = datetime()
        `,
        { userId, name, email, passwordHash, title, experienceYears },
        'WRITE'
      );

      // Connect initial skills if selected
      if (Array.isArray(skills) && skills.length > 0) {
        for (const skillName of skills) {
          await runQuery(
            `MATCH (u:User {id: $userId}), (s:Skill {name: $skillName})
             MERGE (u)-[:HAS_SKILL {proficiency: 'Proficient', addedAt: datetime()}]->(s)`,
            { userId, skillName },
            'WRITE'
          );
        }
      }

      const token = jwt.sign({ id: userId, email, name, title }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: { id: userId, name, email, title, experienceYears }
      });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const results = await runQuery(
        `MATCH (u:User {email: $email})
         OPTIONAL MATCH (u)-[:HAS_SKILL]->(s:Skill)
         RETURN u, collect(DISTINCT s.name) AS skills`,
        { email }
      );

      if (results.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const userRecord = results[0].u;
      const skills = results[0].skills || [];
      const isMatch = await bcrypt.compare(password, userRecord.passwordHash);

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        { id: userRecord.id, email: userRecord.email, name: userRecord.name, title: userRecord.title },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
          title: userRecord.title,
          experienceYears: userRecord.experienceYears,
          skills
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getMe(req, res) {
    try {
      const userId = req.user.id;
      const results = await runQuery(
        `MATCH (u:User {id: $userId})
         OPTIONAL MATCH (u)-[:HAS_SKILL]->(s:Skill)
         OPTIONAL MATCH (s)-[:BELONGS_TO]->(d:Domain)
         RETURN u, collect(DISTINCT {
           name: s.name,
           category: s.category,
           domain: d.name
         }) AS skills`,
        { userId }
      );

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const u = results[0].u;
      const skills = (results[0].skills || []).filter(s => s.name !== null);

      return res.json({
        success: true,
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          title: u.title,
          experienceYears: u.experienceYears,
          skills
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getDemoProfiles(req, res) {
    try {
      const results = await runQuery(
        `MATCH (u:User)
         WHERE u.email ENDS WITH '@wexa.ai'
         MATCH (u)-[:HAS_SKILL]->(s:Skill)
         RETURN u.id AS id, u.name AS name, u.email AS email, u.title AS title,
                u.experienceYears AS experienceYears, collect(DISTINCT s.name) AS skills
         ORDER BY u.experienceYears DESC`
      );
      return res.json({ success: true, demoUsers: results });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = AuthController;
