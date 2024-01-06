const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/login', userController.get);
router.get('/signup', userController.signUp);
router.post('/create-user', userController.createUser);

module.exports = router;