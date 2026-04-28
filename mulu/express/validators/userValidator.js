const {body} = require('express-validator');
const errorBack = require('./errorBack');
const { User } = require('../models/index');
const { Op } = require('sequelize');
// 用户注册验证规则
const userRegisterValidator =errorBack([
  body('phone').trim().notEmpty().withMessage('手机号不能为空').bail()
  .isMobilePhone().withMessage('手机号格式不正确').bail()
  .custom(async (phone) => {
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      throw new Error('手机号已被注册');
    }
  }),
  body('email').trim().notEmpty().withMessage('邮箱不能为空').bail()
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

// 用户登录验证规则
const userLoginValidator = errorBack([
  body('account').trim().notEmpty().withMessage('账号或密码不能为空').bail(),
  body('password').trim().notEmpty().withMessage('账号或密码不能为空').bail(),
  body('account').custom(async (account) => {
    const user = await User.findOne({ where: { 
      [Op.or]: [
        { username: account },
        { email: account },
        { phone: account }
      ],
     }
    });
    if (!user) {
      throw new Error('账号未注册');
    }
  })
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
  body('age').optional().isInt({ max: 200 }).withMessage('年龄必须是整数且不超过200').bail(),
  body('name').optional().trim().notEmpty().withMessage('用户名不能为空').bail(),
  body('username').optional().trim().notEmpty().withMessage('用户名不能为空').bail()
  .custom(async (username, { req }) => {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser && existingUser.id !== req.body.id) {
      throw new Error('用户名已被注册');
    }
  }),
  body('phone').optional().trim().notEmpty().withMessage('手机号不能为空').bail()
  .custom(async (phone, { req }) => {
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new Error('手机号格式不正确');
    }
    const existingUser = await User.findOne({ where: { phone } });
    // 验证手机号是否已被注册，排除当前用户,同时适用于修改个人账号信息req.user.id
    if (existingUser && existingUser.id !== req.body.id) {
      throw new Error('手机号已被注册');
    }
  })
])

// 修改个人信息验证规则
const updateProfileValidator = errorBack([
  body('email').optional().trim().notEmpty().withMessage('邮箱不能为空').bail()
  .isEmail().withMessage('邮箱格式不正确').bail()
  .custom(async (email, { req }) => {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser && existingUser.id !== req.user.id) {
      throw new Error('邮箱已被注册');
    }
  }),
  body('age').optional().isInt({ max: 200 }).withMessage('年龄必须是整数且不超过200').bail(),
  body('name').optional().trim().notEmpty().withMessage('用户名不能为空').bail(),
  body('username').optional().trim().notEmpty().withMessage('用户名不能为空').bail()
  .custom(async (username, { req }) => {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser && existingUser.id !== req.user.id) {
      throw new Error('用户名已被注册');
    }
  }),
  body('phone').optional().trim().notEmpty().withMessage('手机号不能为空').bail()
  .custom(async (phone, { req }) => {
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new Error('手机号格式不正确');
    }
    const existingUser = await User.findOne({ where: { phone } });
    // 验证手机号是否已被注册，排除当前用户,同时适用于修改个人账号信息req.user.id
    if (existingUser && existingUser.id !== req.user.id) {
      throw new Error('手机号已被注册');
    }
  })
])

module.exports = { 
  userRegisterValidator,
  userEditValidator,
  userLoginValidator,
  updateProfileValidator
};