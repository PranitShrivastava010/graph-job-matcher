const express = require('express');
const router = express.Router();
const GraphController = require('../controllers/graphController');
const { optionalAuth } = require('../middleware/auth');

router.get('/explore', optionalAuth, GraphController.getGraphData);
router.get('/health', GraphController.getHealth);

module.exports = router;
