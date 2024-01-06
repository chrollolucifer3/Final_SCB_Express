const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

router.post('/create-list', listController.create);
router.get('/delete-list/:id', listController.delete);
router.get('/edit-list/:id', listController.edit);
router.post('/list/update/:id', listController.update)
module.exports = router;