const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const Joi = require('joi');
const auth = require('../middlewares/auth');
const render = require('../configs/render')

const userValidationSchema = Joi.object({
  username: Joi.string().alphanum().min(8).required().messages({
    'any.required': `"username" cannot be left blank!`,
    'string.min': 'Username must be at least 8 characters.'
  }),
  password: Joi.string().required().pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/).messages({
    'string.pattern.base': 'Password must contain at least 1 capital letter, 1 number, and 1 special character.',
    'any.required': 'Password cannot be left blank.'
  })
  .min(8)
  .messages({
    'string.min': 'Password must have at least 8 characters.'
  }),
  fullname: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^(0\d{9})$/).required().messages({
    'string.pattern.base': 'The phone number must have exactly 10 digits and start with 0.',
    'any.required': 'Phone number cannot be left blank.'
  }),
  boards: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1), // Assuming Board ObjectId
  cards: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1)  // Assuming Card ObjectId
});

  
  // Middleware kiểm tra và xác thực dữ liệu
  const validateUserData = (req, res, next) => {
    const { error, value } = userValidationSchema.validate(req.body, {abortEarly: false});
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return render(req, res, 'signup', { errMessage: errorMessages });
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
            'string.pattern.base': 'Password must contain at least 1 capital letter, 1 number, and 1 special character.',
            'any.required': 'New password cannot be left blank.',
            'string.min': 'The new password must have at least 8 characters.'
        }),
        confirmNewPassword: Joi.string()
        .required()
        .valid(Joi.ref('newPassword'))
        .messages({
            'any.only': 'The re-entered password does not match the new password.'
        })
});

const validateChangePasswordData = (req, res, next) => {
    const { error, value } = changePasswordValidationSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return render(req, res, 'changepassword',{ errMessage: errorMessages });
    }

    req.body = value;
    next();
};

const resetPasswordValidationSchema = Joi.object({
  newPassword: Joi.string()
      .min(8)
      .required()
      .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/)
      .messages({
          'string.pattern.base': 'Password must contain at least 1 capital letter, 1 number, and 1 special character.',
          'any.required': 'New password cannot be left blank.',
          'string.min': 'The new password must have at least 8 characters.'
      })
});

const validateResetPasswordData = (req, res, next) => {
  const { error, value } = resetPasswordValidationSchema.validate(req.body, { abortEarly: false });
  const token = req.params.token;
  if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).render('reset-pass',{token, errMessage: errorMessages });
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
router.post('/forgot-password', userController.forgotPass);
router.get('/forgot-password', userController.getForgot);
router.post('/reset-password/:token',validateResetPasswordData, userController.resetPass);
router.get('/reset-password/:token', userController.getReset);

module.exports = router;