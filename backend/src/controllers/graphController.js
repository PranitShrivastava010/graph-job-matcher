const CypherService = require('../services/cypherService');
const { verifyConnection } = require('../config/db');

class GraphController {
  static async getGraphData(req, res) {
    try {
      const userId = req.user?.id || null;
      const data = await CypherService.getGraphVisualizationData(userId);
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getHealth(req, res) {
    try {
      const dbStatus = await verifyConnection();
      return res.json({
        success: true,
        status: 'UP',
        database: {
          engine: 'CognoDB / openCypher (Neo4j Protocol)',
          connected: dbStatus.success
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      return res.status(500).json({ success: false, status: 'DOWN', error: err.message });
    }
  }
}

module.exports = GraphController;
