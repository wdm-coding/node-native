const { File, Comment, User, FileLike, Collect } = require("../models")
const { failBack, successBack } = require("../utils/backBody")
const { hotInc, topHots, getHot } = require("../models/fileHot")

module.exports = {
	// 获取文件列表
	getList: async (ctx) => {
		try {
			// 分页查询
			const pageNum = parseInt(ctx.query.pageNum) || 1
			const pageSize = parseInt(ctx.query.pageSize) || 10
			if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
				return failBack(ctx, { message: "无效的分页参数" })
			}
			const offset = (pageNum - 1) * pageSize
			const { count, rows } = await File.findAndCountAll({
				offset,
				order: [["created_at", "DESC"]],
				limit: pageSize,
			})
			const files = rows.map((file) => file.dataValues)
			for (let file of files) {
				const hotNum = await getHot(file.id)
				file.hotNum = hotNum || 0
			}
			successBack(ctx, {
				list: files,
				total: count,
				currentPage: pageNum,
			})
		} catch (error) {
			failBack(ctx, error)
		}
	},
	// 新增文件信息
	addFile: async (ctx) => {
		try {
			const { filename, size, originalname, description } = ctx.request.body
			const newFile = await File.create({
				filename,
				size,
				originalname: originalname || "null",
				description: description || "null",
				uploadUserId: ctx.user.id, // 假设通过中间件获取当前登录用户信息，并从中提取 userId
			})
			successBack(ctx, { id: newFile.id })
		} catch (error) {
			failBack(ctx, error)
		}
	},
	// 获取用户(频道)文件列表
	getUserFileList: async (ctx) => {
		try {
			const userId = ctx.params.userId
			// 确认用户是否存在
			const user = await User.findByPk(userId)
			if (!user) {
				return failBack(ctx, { message: "用户不存在" })
			}
			// 分页查询
			const pageNum = parseInt(ctx.query.pageNum) || 1
			const pageSize = parseInt(ctx.query.pageSize) || 10
			if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
				return failBack(ctx, { message: "无效的分页参数" })
			}
			const offset = (pageNum - 1) * pageSize
			const { count, rows } = await File.findAndCountAll({
				where: {
					uploadUserId: userId,
				},
				offset,
				order: [["created_at", "DESC"]],
				limit: pageSize,
			})
			const files = rows.map((file) => file.dataValues)
			for (let file of files) {
				const hotNum = await getHot(file.id)
				file.hotNum = hotNum || 0
			}
			successBack(ctx, {
				list: files,
				total: count,
				currentPage: pageNum,
			})
		} catch (error) {
			failBack(ctx, error)
		}
	},
	// 新增文件评论信息
	addComment: async (ctx) => {
		try {
			const { fileId, content } = ctx.request.body
			// 确认文件是否存在
			const file = await File.findByPk(fileId)
			if (!file) {
				return failBack(ctx, { message: "文件不存在" })
			}
			// 创建评论记录
			const newComment = await Comment.create({
				content,
				userId: ctx.user.id, // 当前登录用户ID
				fileId, // 文件ID
			})
			// 更新文件评论数量
			await file.increment("commentCount")
			await hotInc(fileId, 2)
			successBack(ctx, { id: newComment.id })
		} catch (error) {
			failBack(ctx, error)
		}
	},
}
