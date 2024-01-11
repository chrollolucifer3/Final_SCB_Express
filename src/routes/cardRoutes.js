const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const upload = require('../middlewares/multerConfig');
const auth = require('../middlewares/auth');
const Joi = require('joi');


router.get('/:id/create-card', auth, cardController.get);
router.post('/:id/card/store', auth, upload.coverUpload.single('cover'), cardController.create);
router.get('/:id/card-detail', auth, cardController.detail);
router.get('/:id/add-attachment', auth, cardController.addFIle);
router.post('/:id/attachment-store', auth, upload.fileUpload.single('attachment'), cardController.updateAttachment);
router.post('/:id/update-description', auth, cardController.updateDescription);
router.get('/:id/delete-card', auth, cardController.deleteCard);
router.get('/:id/add-member', auth, cardController.member);
router.post('/:id/member-store', auth, cardController.addMember);

module.exports = router;