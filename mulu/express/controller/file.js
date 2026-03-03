const { File } = require('../models');
const {failBack,successBack} = require('../utils/backBody');

// 获取文件列表
async function getList(req, res) {
  try {
    // 分页查询
    const pageNum = parseInt(req.query.pageNum) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
        return failBack(res,{message:'无效的分页参数'});
    }
    const offset = (pageNum - 1) * pageSize;
    const { count, rows } = await File.findAndCountAll({
      offset,
      order: [['created_at', 'DESC']],
      limit: pageSize,
    });
    const files = rows.map(file => file.dataValues);
    successBack(res,{
      list: files,
      total: count,
      currentPage: pageNum
    })
  } catch (error) {
    failBack(res, error,500);
  }
}

// 新增文件信息
async function addFile(req, res) {
  try {
    const { filename, size, originalname, description } = req.body;
    const newFile = await File.create({
      filename,
      size,
      originalname: originalname || 'null',
      description: description || 'null',
      userId: req.user.id, // 假设通过中间件获取当前登录用户信息，并从中提取 userId
    });
    successBack(res, {id: newFile.id});
  } catch (error) {
    failBack(res, error, 500);
  }
}

// 编辑文件信息（originalname，description）
async function updateFile(req, res) {
  try {
    const { id, ...updateData } = req.body;
    const file = await File.findByPk(id);
    if (!file) {
      return failBack(res, {msg: '文件不存在'}, 200);
    }
    await file.update(updateData, { fields: ['originalname', 'description'] });
    successBack(res, {id});
  } catch (error) {
    failBack(res, error, 500);
  }
}

// 删除文件信息（此处仅为示意，实际项目中应添加验证和权限检查）
async function deleteFile(req, res) {
  try {
    const { id } = req.params;
    const file = await File.findByPk(id);
    if (!file) {
      return failBack(res, {msg: '文件不存在'}, 200);
    }
    if(file.userId !== req.user.id){
      return failBack(res, {msg: '无权限删除此文件'}, 403);
    }
    await file.destroy();
    successBack(res, null);
  } catch (error) {
    failBack(res, error, 500);
  }
}

module.exports = {
  getList,
  addFile,
  updateFile,
  deleteFile
}