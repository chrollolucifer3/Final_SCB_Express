const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

router.get('/create-card/:id', cardController.get);

module.exports = router;