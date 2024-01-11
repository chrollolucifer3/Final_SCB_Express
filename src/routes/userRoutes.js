const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');



router.post('/login',  userController.login);
router.get('/login', userController.get);
router.get('/signup', userController.signUp);
router.post('/create-user', userController.createUser);
router.get('/logout', userController.logOut);

module.exports = router;