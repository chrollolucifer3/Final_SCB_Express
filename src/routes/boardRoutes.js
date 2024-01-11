const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const upload = require('../middlewares/multerConfig');
const auth = require('../middlewares/auth');


router.get('/create', auth, boardController.get)
router.post('/store', auth, upload.coverUpload.single('cover'), boardController.create)
router.get('/edit/:id', auth, boardController.edit);
router.post('/update/:id', auth, upload.coverUpload.single('cover'), boardController.update)
router.get('/delete/:id', auth, boardController.delete);
router.get('/detail/:id', auth, boardController.detail);


module.exports = router;