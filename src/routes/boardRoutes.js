const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const upload = require('../middlewares/multerConfig');
const auth = require('../middlewares/auth');
const Joi = require('joi'); 

const boardValidationSchema = Joi.object({
    title: Joi.string().required().messages({
      'any.required': 'Board title cannot be left blank.'
    }),
    // Các trường khác trong form, nếu có
  });
  
  const validateBoardTitle = (req, res, next) => {
    const { error } = boardValidationSchema.validate(req.body, { abortEarly: false });
  
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).render('createboard', { errMessage: errorMessages });
    }
  
    next();
  };

router.get('/create', auth, boardController.get)
router.post('/store', auth, validateBoardTitle, upload.coverUpload.single('cover'), boardController.create)
router.get('/edit/:id', auth, boardController.edit);
router.post('/update/:id', auth, upload.coverUpload.single('cover'), boardController.update)
router.get('/delete/:id', auth, boardController.delete);
router.get('/detail/:id', auth, boardController.detail);


module.exports = router;