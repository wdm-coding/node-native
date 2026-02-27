const {body} = require('express-validator');
const errorBack = require('./errorBack');
const { User } = require('../models/index');

// 用户注册验证规则
const userRegisterValidator =errorBack([
  body('email').optional().trim().notEmpty().withMessage('邮箱不能为空').bail()
  .isEmail().withMessage('邮箱格式不正确').bail()
  .custom(async (email) => {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('邮箱已被注册');
    }
  }),
  body('username').trim().notEmpty().withMessage('用户名不能为空').bail()
  .custom(async (username) => {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new Error('用户名已被注册');
    }
  }),
  body('password').trim().isLength({ min: 6 }).withMessage('密码长度至少为6位'),
  body('age').optional().isInt({ max: 200 }).withMessage('年龄必须是整数且不超过200'),
]) 

// 用户编辑验证规则
const userEditValidator = errorBack([
  body('email').optional().trim().notEmpty().withMessage('邮箱不能为空').bail()
  .isEmail().withMessage('邮箱格式不正确').bail()
  .custom(async (email, { req }) => {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && existingUser.id !== req.body.id) {
      throw new Error('邮箱已被注册');
    }
  }),
  body('age').optional().isInt({ max: 200 }).withMessage('年龄必须是整数且不超过200'),
  body('name').optional().trim().notEmpty().withMessage('用户名不能为空')
])


module.exports = { 
  userRegisterValidator,
  userEditValidator
};