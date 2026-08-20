const express = require('express');
const router = express.Router();
const JobController = require('../controllers/jobController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, JobController.getJobs);
router.get('/direct-matches', requireAuth, JobController.getDirectMatches);
router.get('/related-matches', requireAuth, JobController.getRelatedMatches);
router.get('/skill-gap', requireAuth, JobController.getSkillGap);
router.get('/:id', optionalAuth, JobController.getJobDetail);

module.exports = router;
