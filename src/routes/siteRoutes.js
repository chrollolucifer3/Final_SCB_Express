const express = require('express');
const router = express.Router();
const SiteController = require('../controllers/siteController');

router.get('/', SiteController.get);

module.exports = router;