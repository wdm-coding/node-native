const { File,Comment,User } = require('../models');
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

// 编辑文件信息(originalname，description)
async function updateFile(req, res) {
  try {
    const { id, ...updateData } = req.body;
    const file = await File.findByPk(id);
    if (!file) {
      return failBack(res, {message: '文件不存在'}, 200);
    }
    await file.update(updateData, { fields: ['originalname', 'description'] });
    successBack(res, {id});
  } catch (error) {
    failBack(res, error, 500);
  }
}

// 删除文件信息
async function deleteFile(req, res) {
  try {
    const { id } = req.params;
    const file = await File.findByPk(id);
    if (!file) {
      return failBack(res, {message: '文件不存在'}, 200);
    }
    if(file.userId !== req.user.id){
      return failBack(res, {message: '无权限删除此文件'}, 403);
    }
    await file.destroy();
    successBack(res, null);
  } catch (error) {
    failBack(res, error, 500);
  }
}

// 添加评论信息(fileId)
async function addComment(req, res) {
  try {
    const { fileId, content } = req.body;
    // 验证文件是否存在
    const file = await File.findByPk(fileId);
    if (!file) {
      return failBack(res, {message: '文件不存在'}, 200);
    }
    // 创建评论记录
    const newComment = await Comment.create({
      content,
      userId: req.user.id, // 当前登录用户ID
      fileId, // 文件ID
    });
    // 更新文件评论数量
    await file.increment('commentCount');
    successBack(res, { id: newComment.id });
  } catch (error) {
    failBack(res, error, 500);
  }
}

// 查询文章评论列表
async function getCommentList(req, res) {
  try {
    const pageNum = parseInt(req.query.pageNum) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
        return failBack(res,{message:'无效的分页参数'});
    }
    const offset = (pageNum - 1) * pageSize;
    // 根据文件ID查询评论列表，并包含用户信息
    const comments = await Comment.findAll({
      where: { fileId: req.query.fileId },
      include: [{ 
        model: User,
        as: 'commentUser', 
        attributes: ['id', 'name'] 
      }],
      offset,
      limit: pageSize,
      order: [['created_at', 'DESC']],
    });
    const backData = {
      list: comments.map(comment => {
        const params = {
          ...comment.dataValues,
          userId: comment.dataValues.commentUser.id,
          nickname: comment.dataValues.commentUser.name
        }
        delete params.commentUser; // 删除冗余字段
        return params;
      }),
      total: comments.length,
      currentPage: pageNum
    }
    successBack(res,backData);
  } catch (error) {
    failBack(res, error, 500);
  }
}

module.exports = {
  getList,
  addFile,
  updateFile,
  deleteFile,
  addComment,
  getCommentList
}