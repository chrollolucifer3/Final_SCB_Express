const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const auth = require('../middlewares/auth');

router.get('/:id/create-list', auth, listController.get);
router.post('/:id/list-store', auth, listController.create);
router.get('/delete-list/:id', auth, listController.delete);
router.get('/edit-list/:id', auth, listController.edit);
router.post('/list/update/:id', auth, listController.update);


module.exports = router;