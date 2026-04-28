const {body} = require('express-validator');
const errorBack = require('./errorBack');
const { File } = require('../models/index');

// 新增文件验证规则
const fileAddValidator = errorBack([
  body('filename').trim().notEmpty().withMessage('文件名不能为空').bail()
  .custom(async filename => {
    const existingFile = await File.findOne({ where: { filename } });
    if (existingFile) {
      throw new Error('文件名已存在');
    }
  }),
  body('size').isInt({ min: 1 }).withMessage('文件大小必须是大于0的整数').bail(),
  body('originalname').optional().trim().isLength({ max: 20 }).withMessage('文件名长度不能超过20个字符').bail(),
  body('description').optional().trim().bail(),
])

// 编辑文件验证规则(仅允许修改 originalname 和 description)
const fileUpdateValidator = errorBack([
  body('originalname').optional().trim().isLength({ max: 20 }).withMessage('文件名长度不能超过20个字符'),
  body('description').optional().trim(),
])

// likeFile 验证likeFile 参数
const likeFileValidator = errorBack([
  // 必须是枚举值1或者-1
  body('isLike').notEmpty().withMessage('like参数不能为空').bail()
  .custom(async isLike => {
    if (isLike !== 1 && isLike !== -1) {
      throw new Error('like参数必须是1或者-1');
    }
  })
])
module.exports = {
  fileAddValidator,
  fileUpdateValidator,
  likeFileValidator
}