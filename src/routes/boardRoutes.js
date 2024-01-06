const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const upload = require('../middlewares/multerConfig');

router.get('/create', boardController.get)
router.post('/store', upload.coverUpload.single('cover'), boardController.create)
router.get('/edit/:id', boardController.edit);
router.post('/update/:id', upload.coverUpload.single('cover'), boardController.update)
router.get('/delete/:id', boardController.delete)
router.get('/detail/:id', boardController.detail)



module.exports = router;