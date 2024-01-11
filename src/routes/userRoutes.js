const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const Joi = require('joi');

const userValidationSchema = Joi.object({
    username: Joi.string().alphanum().required().messages({
      'any.required': `"username" không được bỏ trống !`
    }),
    password: Joi.string().required().pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/).messages({
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ viết hoa, 1 số, và 1 kí tự đặc biệt.',
      'any.required': 'Mật khẩu không được bỏ trống.'
    })
    .min(8)
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 8 kí tự.'
    }),
    fullname: Joi.string().required(),
    email: Joi.string().email().required(),
    boards: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1), // Assuming Board ObjectId
    cards: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1)  // Assuming Card ObjectId
  });
  
  // Middleware kiểm tra và xác thực dữ liệu
  const validateUserData = (req, res, next) => {
    const { error, value } = userValidationSchema.validate(req.body, {abortEarly: false});
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      res.locals.errMessage = errorMessages;
      return res.status(400).render('signup', { errMessage: res.locals.errMessage });
    }
  
    // Dữ liệu hợp lệ, gán lại vào req.body và chuyển đến middleware tiếp theo hoặc xử lý logic
    req.body = value;
    next();
  };

router.post('/login', validateUserData,  userController.login);
router.get('/login', userController.get);
router.get('/signup', userController.signUp);
router.post('/create-user', validateUserData, userController.createUser);
router.get('/logout', userController.logOut);

module.exports = router;