const { File, Comment, User, FileLike,Collect } = require("../models")
const { failBack, successBack } = require("../utils/backBody")

// 获取文件列表
async function getList(req, res) {
	try {
		// 分页查询
		const pageNum = parseInt(req.query.pageNum) || 1
		const pageSize = parseInt(req.query.pageSize) || 10
		if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
			return failBack(res, { message: "无效的分页参数" })
		}
		const offset = (pageNum - 1) * pageSize
		const { count, rows } = await File.findAndCountAll({
			offset,
			order: [["created_at", "DESC"]],
			limit: pageSize,
		})
		console.log(rows)
		const files = rows.map((file) => file.dataValues)
		successBack(res, {
			list: files,
			total: count,
			currentPage: pageNum,
		})
	} catch (error) {
		failBack(res, error, 500)
	}
}

// 新增文件信息
async function addFile(req, res) {
	try {
		const { filename, size, originalname, description } = req.body
		const newFile = await File.create({
			filename,
			size,
			originalname: originalname || "null",
			description: description || "null",
			uploadUserId: req.user.id, // 假设通过中间件获取当前登录用户信息，并从中提取 userId
		})
		successBack(res, { id: newFile.id })
	} catch (error) {
		failBack(res, error, 500)
	}
}

// 编辑文件信息(originalname，description)
async function updateFile(req, res) {
	try {
		const { id, ...updateData } = req.body
		const file = await File.findByPk(id)
		if (!file) {
			return failBack(res, { message: "文件不存在" }, 200)
		}
		await file.update(updateData, { fields: ["originalname", "description"] })
		successBack(res, { id })
	} catch (error) {
		failBack(res, error, 500)
	}
}

// 删除文件信息
async function deleteFile(req, res) {
	try {
		const { id } = req.params
		const file = await File.findByPk(id)
		if (!file) {
			return failBack(res, { message: "文件不存在" }, 200)
		}
		if (file.userId !== req.user.id) {
			return failBack(res, { message: "无权限删除此文件" }, 403)
		}
		await file.destroy()
		successBack(res, null)
	} catch (error) {
		failBack(res, error, 500)
	}
}

// 添加评论信息(fileId)
async function addComment(req, res) {
	try {
		const { fileId, content } = req.body
		// 验证文件是否存在
		const file = await File.findByPk(fileId)
		if (!file) {
			return failBack(res, { message: "文件不存在" }, 200)
		}
		// 创建评论记录
		const newComment = await Comment.create({
			content,
			userId: req.user.id, // 当前登录用户ID
			fileId, // 文件ID
		})
		// 更新文件评论数量
		await file.increment("commentCount")
		successBack(res, { id: newComment.id })
	} catch (error) {
		failBack(res, error, 500)
	}
}

// 查询文章评论列表
async function getCommentList(req, res) {
	try {
		const pageNum = parseInt(req.query.pageNum) || 1
		const pageSize = parseInt(req.query.pageSize) || 10
		if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
			return failBack(res, { message: "无效的分页参数" })
		}
		const offset = (pageNum - 1) * pageSize
		// 根据文件ID查询评论列表，并包含用户信息
		const comments = await Comment.findAll({
			where: { fileId: req.query.fileId },
			include: [
				{
					model: User,
					as: "commentUser",
					attributes: ["id", "name"],
				},
			],
			offset,
			limit: pageSize,
			order: [["created_at", "DESC"]],
		})
		const backData = {
			list: comments.map((comment) => {
				const params = {
					...comment.dataValues,
					userId: comment.dataValues.commentUser.id,
					nickname: comment.dataValues.commentUser.name,
				}
				delete params.commentUser // 删除冗余字段
				return params
			}),
			total: comments.length,
			currentPage: pageNum,
		}
		successBack(res, backData)
	} catch (error) {
		failBack(res, error, 500)
	}
}

// 删除评论信息
async function deleteComment(req, res) {
	try {
		const { commentId, fileId } = req.body
		// 验证文件是否存在
		const file = await File.findByPk(fileId)
		if (!file) {
			return failBack(res, { message: "文件不存在" }, 200)
		}
		// 验证评论是否存在
		const comment = await Comment.findByPk(commentId)
		if (!comment) {
			return failBack(res, { message: "评论不存在" }, 200)
		}
		// 检查用户是否有权限删除此评论（例如，只有作者可以删除自己的评论）
		if (comment.userId !== req.user.id) {
			return failBack(res, { message: "无权删除该评论" }, 403)
		}
		await comment.destroy()
		// 更新文件评论数量
		await file.decrement("commentCount")
		successBack(res, null)
	} catch (error) {
		failBack(res, error, 500)
	}
}

// 标注文件为喜欢或不喜欢
async function likeFile(req, res) {
	try {
		let isChange = false
		const { fileId } = req.params
		const { isLike } = req.body
		// 验证文件是否存在
		const file = await File.findByPk(fileId)
		if (!file) {
			return failBack(res, { message: "文件不存在" }, 200)
		}
		// 检查用户是否已经点赞过该文件
		const fileLike = await FileLike.findOne({
			where: {
				fileId,
				userId: req.user.id,
			},
		})
		if (fileLike) {
			// 如果有记录，更新isLike
			if (fileLike.like !== isLike) {
				await fileLike.update({ like: isLike })
				isChange = true
			}
		} else {
			// 如果没有记录，创建记录
			await FileLike.create({
				fileId,
				userId: req.user.id,
				like: isLike,
			})
			isChange = true
		}
		if (!isChange) {
			return successBack(res, {
				isLike: fileLike.like === 1 ? true : false,
				likeCount: file.dataValues.likeCount,
			})
		}
		// 更新点赞数量
		if (isLike === 1) {
			await file.increment("likeCount") // 增加点赞数
		} else {
			if (file.dataValues.likeCount > 0) {
				await file.decrement("likeCount") // 减少点赞数，但至少为0
			}
		}
		return successBack(res, {
			isLike: isLike === 1 ? true : false,
			likeCount: Math.max(0, file.dataValues.likeCount - (isLike === 1 ? -1 : 1)),
		})
	} catch (error) {
		failBack(res, error, 500)
	}
}

// 用户喜欢或不喜欢的文件列表
async function likeFileList(req, res) {
	// 分页查询
	try {
		const pageNum = parseInt(req.query.pageNum) || 1
		const pageSize = parseInt(req.query.pageSize) || 10
		if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
			return failBack(res, { message: "无效的分页参数" })
		}
		const offset = (pageNum - 1) * pageSize
		// 构建动态查询条件
    const queryOptions = {
      where: {userId: req.user.id},
      include: [
        {
          model: File,
          as: "fileInfo"
        },
      ],
      offset,
      limit: pageSize,
      order: [["created_at", "DESC"]],
			attributes: {
        exclude: ['userId'] // 排除 updatedAt，因为前端不需要更新时间戳信息
      },
    }
    // 动态添加 File 表的like查询条件
    if (req.query.isLike !== undefined) {
      const isLike = parseInt(req.query.isLike)
      if (!isNaN(isLike)) {
        queryOptions.where.like = isLike
      }
    }
    const likeList = await FileLike.findAll(queryOptions)
		const backData = {
			list: likeList.map((item) => {
				delete item.dataValues.fileInfo.dataValues.id
				const params = {
					...item.dataValues,
					...item.dataValues.fileInfo.dataValues
				}
				delete params.fileInfo // 删除冗余字段
				return params
			}),
			total: likeList.length,
			currentPage: pageNum,
		}
		successBack(res, backData)
	} catch (error) {
		failBack(res, error, 500)
	}
}

// 获取文件详情 ：文件信息，点赞数，踩数，评论列表
async function getFileDetail(req, res) {
	try {
		const fileId = req.params.fileId
		// 查询文件详情
		const file = await File.findByPk(fileId,{
			include: [{
				model: Comment,
				as: 'comments',
				attributes: ['id','content','created_at'],
				include: [{
					model: User,
					as: 'commentUser',
					attributes: ['id', 'name']
				}]
			}],
			attributes: {
				exclude: ['updatedAt']
			}
		})
		if (!file) {
			return failBack(res, { message: "文件不存在" }, 200)
		}
		// 查询点赞数和踩数
		const likeCount = await FileLike.count({
			where: { fileId, like: 1 }, // 只计算点赞数
		})
		const dislikeCount = await FileLike.count({
			where: { fileId, like: -1 }, // 只计算踩数
		})
		const comments = file.comments.map(comment => {
			const params = {
				...comment.dataValues,
				commentId: comment.dataValues.id,
				commentUser: comment.dataValues.commentUser.dataValues.name,
				created_at: comment.dataValues.created_at
			}
			delete params.id
			return params
		})
		successBack(res, {
			...file.dataValues,
			likeCount,
			dislikeCount,
			comments
		})
	} catch (error) {
		failBack(res, error, 500)
	}
}

// 文件收藏
async function addCollect(req, res) {
	try {
		const userId = req.user.id
		const fileId = req.params.fileId
		const status = req.body.status
		if(![1, -1].includes(status)) return failBack(res, { message: "无效的收藏状态" }, 200)
		// 检查文件是否存在
		const file = await File.findByPk(fileId)
		if (!file) {
			return failBack(res, { message: "文件不存在" }, 200)
		}
		// 检查用户是否已经收藏
		const collect = await Collect.findOne({
			where: { userId, fileId }
		})
		if (collect && status === 1) { 
			return failBack(res, { message: "已收藏" }, 200)
		}
		if (collect && status === -1) { // 取消收藏
			await collect.destroy()
			return successBack(res, {}, "取消收藏")
		}
		if(!collect && status === -1) {
			return failBack(res, { message: "未收藏" }, 200)
		}
		// 添加收藏
		const result = await Collect.create({
			userId,
			fileId
		})
		successBack(res,{collectId:result.id} ,"收藏成功")
	} catch (error) {
		failBack(res, error, 500)
	}
}

// 文件热度 查看文件+1，点赞+2，评论+2，收藏+3


module.exports = {
	getList,
	addFile,
	updateFile,
	deleteFile,
	addComment,
	getCommentList,
	deleteComment,
	likeFile,
  likeFileList,
	getFileDetail,
	addCollect
}
