const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const Joi = require('joi');
const auth = require('../middlewares/auth');

const userValidationSchema = Joi.object({
  username: Joi.string().alphanum().min(8).required().messages({
    'any.required': `"username" không được bỏ trống !`,
    'string.min': 'Tên người dùng phải có ít nhất 8 kí tự.'
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
  phone: Joi.string().pattern(/^(0\d{9})$/).required().messages({
    'string.pattern.base': 'Số điện thoại phải có đúng 10 số và bắt đầu bằng số 0.',
    'any.required': 'Số điện thoại không được bỏ trống.'
  }),
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

  const changePasswordValidationSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
        .min(8)
        .required()
        .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)
        .messages({
            'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ viết hoa, 1 số, và 1 kí tự đặc biệt.',
            'any.required': 'Mật khẩu mới không được bỏ trống.',
            'string.min': 'Mật khẩu mới phải có ít nhất 8 kí tự.'
        }),
        confirmNewPassword: Joi.string()
        .required()
        .valid(Joi.ref('newPassword'))
        .messages({
            'any.only': 'Mật khẩu nhập lại không khớp với mật khẩu mới.'
        })
});

const validateChangePasswordData = (req, res, next) => {
    const { error, value } = changePasswordValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return res.status(400).render('changepassword',{ errMessage: errorMessages });
    }

    req.body = value;
    next();
};

router.post('/login',  userController.login);
router.get('/login', userController.get);
router.get('/signup', userController.signUp);
router.post('/create-user', validateUserData, userController.createUser);
router.get('/logout', userController.logOut);
router.get('/manage-user', auth, userController.manageUser);
router.get('/change-password', auth, userController.getChange)
router.post('/update-password', auth, validateChangePasswordData, userController.updatePassword);
router.get('/manage-card', auth, userController.getCard);
router.get('/:id/delete-card-added', auth, userController.deleteCard)

module.exports = router;