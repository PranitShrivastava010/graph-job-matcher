const CypherService = require('../services/cypherService');

class JobController {
  static async getJobs(req, res) {
    try {
      const { search = '', experience = '', company = '', sortBy = 'latest', page = 1, limit = 9 } = req.query;
      const userId = req.user?.id || null;
      const data = await CypherService.getJobs({
        search,
        experience,
        company,
        sortBy,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        userId
      });

      return res.json({ success: true, ...data });
    } catch (err) {
      console.error('getJobs error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getDirectMatches(req, res) {
    try {
      const userId = req.user.id;
      const { search = '', experience = '', limit = 20, skip = 0 } = req.query;
      const jobs = await CypherService.getDirectJobMatches(userId, {
        search,
        experience,
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10)
      });
      return res.json({ success: true, jobs });
    } catch (err) {
      console.error('getDirectMatches error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getRelatedMatches(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20, skip = 0 } = req.query;
      const jobs = await CypherService.getRelatedMultiHopMatches(userId, {
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10)
      });
      return res.json({ success: true, jobs });
    } catch (err) {
      console.error('getRelatedMatches error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getJobDetail(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || null;
      const job = await CypherService.getJobById(id, userId);
      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }
      return res.json({ success: true, job });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getSkillGap(req, res) {
    try {
      const userId = req.user.id;
      const recommendations = await CypherService.getSkillGapRecommendations(userId);
      return res.json({ success: true, recommendations });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = JobController;
