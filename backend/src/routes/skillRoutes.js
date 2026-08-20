const express = require('express');
const router = express.Router();
const SkillController = require('../controllers/skillController');
const { requireAuth } = require('../middleware/auth');

router.get('/', SkillController.getAllSkills);
router.put('/me', requireAuth, SkillController.updateUserSkills);

module.exports = router;
