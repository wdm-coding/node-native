const { failBack, successBack } = require("../utils/backBody")
const { User, Cash, Subscribe } = require("../models")
const md5 = require("../utils/md5") // 引入 md5 加密函数
const { Op } = require("sequelize") // 引入 Sequelize 的 Op 操作符
const { generateToken } = require("../utils/jwt") // 引入 JWT 相关函数
module.exports = {
	// 1. 用户注册
	register: async (ctx) => {
		try {
			const { name, username, password, email, phone, age, avator } = ctx.request.body
			const newUser = await User.create({ name, username, password, email, phone, age, avator })
			successBack(ctx, { id: newUser.id })
		} catch (err) {
			failBack(ctx, err)
		}
	},
	// 2. 用户登录
	login: async (ctx) => {
		try {
			const { account, password } = ctx.request.body // account 可以是用户名、邮箱或手机号
			if (!account || !password) {
				return failBack(ctx, { message: "账号或密码不能为空" })
			}
			// 根据账号查找用户，这里使用了 Op.or 来匹配用户名、邮箱或手机号
			const user = await User.findOne({
				where: {
					[Op.or]: [{ username: account }, { email: account }, { phone: account }],
					password: md5(password), // 使用 md5 加密密码进行匹配
				},
			})
			if (!user) {
				return failBack(ctx, { message: "账号或密码错误" })
			}
			// 生成 JWT token
			const tokenVersion = new Date().getTime()
			const token = await generateToken({
				id: user.id,
				username: user.username,
				email: user.email,
				phone: user.phone,
				tokenVersion,
			})
			// 将userId 为 user.id 的cash 设置为当前的用户的cash
			const cash = await Cash.findOne({ where: { userId: user.id } })
			if (cash) {
				await cash.update({ tokenVersion })
			} else {
				// 如果不存在，则创建一个新的
				await Cash.create({ tokenVersion, userId: user.id })
			}
			successBack(ctx, "Bearer " + token)
		} catch (err) {
			failBack(ctx, err)
		}
	},
	// 3. 获取用户信息
	getUserInfo: async (ctx) => {
		try {
			const { id } = ctx.user
			// 根据用户ID查询用户信息，排除密码字段
			const userInfo = await User.findOne({
				where: { id },
				attributes: { exclude: ["password"] }, // 排除密码字段
			})
			if (!userInfo) {
				return failBack(ctx, { message: "用户不存在" })
			}
			successBack(ctx, userInfo)
		} catch (err) {
			failBack(ctx, err)
		}
	},
	// 4. 获取用户列表
	getUserList: async (ctx) => {
		try {
			// 分页查询
			const pageNum = parseInt(ctx.query.pageNum) || 1
			const pageSize = parseInt(ctx.query.pageSize) || 10
			if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
				return failBack(ctx, { message: "参数错误" })
			}
			const offset = (pageNum - 1) * pageSize
			const { count, rows } = await User.findAndCountAll({
				offset,
				order: [["created_at", "DESC"]],
				limit: pageSize,
				attributes: { exclude: ["password"] }, // 查询时排除密码字段
			})
			successBack(ctx, {
				list: rows,
				total: count,
				currentPage: pageNum,
			})
		} catch (err) {
			failBack(ctx, err)
		}
	},
	// 5. 编辑用户信息
	editUser: async (ctx) => {
		const body = ctx.request.body
		if (!body || !body.id) {
			return failBack(ctx, { message: "缺少用户ID" })
		}
		try {
			const { id, ...updateData } = body
			const [updatedRowsCount] = await User.update(updateData, { where: { id } })
			if (updatedRowsCount === 0) {
				return failBack(ctx, { message: "用户不存在或未修改任何字段" })
			}
			const updatedUser = await User.findByPk(id) // 重新查询以获取更新后的数据
			if (!updatedUser) {
				return failBack(ctx, { message: "用户不存在" })
			} else {
				successBack(ctx, updatedUser.id)
			}
		} catch (err) {
			failBack(ctx, err)
		}
	},
	// 6. 获取用户的频道信息
	getChannel: async (ctx) => {
		let isSubscribe = false
		try {
			const subscribeUserId = ctx.request.params.userId // 查询的用户ID
			if (ctx.user) {
				// 检查是否已经订阅
				const isSub = await Subscribe.findOne({ where: { subscribeUserId: subscribeUserId, userId: ctx.user.id } })
				if (isSub) {
					isSubscribe = true
				}
			}
			// 查询频道信息
			const currentUser = await User.findByPk(subscribeUserId, {
				attributes: ["id", "name", "cover", "channeldes", "avator"],
			})
			if (!currentUser) {
				return failBack(ctx, { message: "用户不存在" })
			}
			currentUser.dataValues.isSubscribe = isSubscribe
			successBack(ctx, currentUser)
		} catch (err) {
			failBack(ctx, err)
		}
	},
	// 7. 订阅用户
	subscribe: async (ctx) => {
		try {
			const userId = ctx.user.id
			const { subscribeUserId } = ctx.request.params
			// 检查subscribeUserId是否存在
			const subscribeUser = await User.findByPk(subscribeUserId)
			if (!subscribeUser) {
				return failBack(ctx, { message: "关注的用户不存在" })
			}
			// 检查是否是自己订阅自己
			if (userId === subscribeUserId) {
				return failBack(ctx, { message: "不能订阅自己" })
			}
			// 检查是否已经订阅
			const existingSubscription = await Subscribe.findOne({ where: { userId, subscribeUserId } })
			if (existingSubscription) {
				return failBack(ctx, { message: "已订阅" })
			}
			// 创建新的订阅记录
			const newRow = await Subscribe.create({ userId, subscribeUserId })
			if (!newRow) {
				return failBack(ctx, { message: "订阅失败" })
			}
			// 更新订阅计数
			await User.increment("subscribeCount", { where: { id: userId } })
			// 更新被订阅用户的粉丝计数
			await User.increment("fansCount", { where: { id: subscribeUserId } })
			successBack(ctx, newRow)
		} catch (err) {
			failBack(ctx, err)
		}
	},
	// 8. 取消订阅用户
	unsubscribe: async (ctx) => {
		try {
			const userId = ctx.user.id
			const { subscribeUserId } = ctx.request.params
			// 检查subscribeUserId是否存在
			const subscribeUser = await User.findByPk(subscribeUserId)
			if (!subscribeUser) {
				return failBack(ctx, { message: "关注的用户不存在" })
			}
			// 检查是否是自己订阅自己
			if (userId === subscribeUserId) {
				return failBack(ctx, { message: "不能取消关注自己" })
			}
			// 检查是否已经订阅
			const existingSubscription = await Subscribe.findOne({ where: { userId, subscribeUserId } })
			if (!existingSubscription) {
				return failBack(ctx, { message: "未关注此用户，无需取消关注" })
			}
			// 删除订阅记录
			await Subscribe.destroy({ where: { id: existingSubscription.id } })
			// 更新订阅计数
			await User.decrement("subscribeCount", { where: { id: userId } })
			// 更新被订阅用户的粉丝计数
			await User.decrement("fansCount", { where: { id: subscribeUserId } })
			successBack(ctx, null)
		} catch (err) {
			failBack(ctx, err)
		}
	},
	// 9. 获取关注的用户列表
	getSubscribes: async (ctx) => {
		try {
			// 查询订阅列表
			const subscribeList = await Subscribe.findAll({
				where: {
					userId: ctx.user.id,
				},
				include: [
					{
						model: User,
						as: "subscribed",
						attributes: ["name", "cover", "avator", "channeldes"],
					},
				],
			})
			if (subscribeList.length === 0) return successBack(ctx, [])
			const list = subscribeList.map((item) => {
				const params = {
					subscriberId: item.dataValues.id,
					...item.subscribed.dataValues,
					...item.dataValues,
				}
				delete params.subscribed
				delete params.id
				return params
			})
			successBack(ctx, list)
		} catch (err) {
			failBack(ctx, err)
		}
	},
}
