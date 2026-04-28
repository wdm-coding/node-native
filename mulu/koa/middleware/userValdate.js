const { User } = require("../models/index")
const { Op } = require("sequelize")
const Joi = require("joi")

module.exports = {
	registerValidate: async (ctx, next) => {
		const schema = Joi.object({
			name: Joi.string().required(),
			email: Joi.string().email().required(),
			username: Joi.string().required(),
			password: Joi.string().min(6).required(),
			phone: Joi.string()
				.pattern(/^1[3-9]\d{9}$/)
				.required(),
			age: Joi.number().integer().min(0).max(120),
		}).validate(ctx.request.body) // 验证请求体是否符合规则
		// 如果验证不通过，抛出错误
		if (schema.error) {
			ctx.throw(400, schema.error)
		}
		// 验证邮箱,手机号，用户名是否已经被注册
		const { email, username, phone } = ctx.request.body
		if (await User.findOne({ where: { email } })) {
			ctx.throw(400, "邮箱已被注册")
		}
		if (await User.findOne({ where: { username } })) {
			ctx.throw(400, "用户名已被注册")
		}
		if (await User.findOne({ where: { phone } })) {
			ctx.throw(400, "手机号已被注册")
		}
		await next()
	},
	loginValidate: async (ctx, next) => {
		const schema = Joi.object({
			account: Joi.string().required(),
			password: Joi.string().min(6).required(),
		}).validate(ctx.request.body)
		if (schema.error) {
			ctx.throw(400, schema.error)
		}
		const { account } = ctx.request.body
		const user = await User.findOne({
			where: {
				[Op.or]: [{ username: account }, { email: account }, { phone: account }],
			},
		})
		if (!user) {
			ctx.throw(400, "账号未注册")
		}
		await next()
	},
	editValidate: async (ctx, next) => {
		const schema = Joi.object({
			name: Joi.string(),
			email: Joi.string().email(),
			username: Joi.string(),
			phone: Joi.string().pattern(/^1[3-9]\d{9}$/),
			age: Joi.number().integer().min(0).max(120),
		})
			.keys()
			.optional()
			.unknown(true)
			.validate(ctx.request.body)
		if (schema.error) {
			ctx.throw(400, schema.error)
		}
		const { email, username, phone, id } = ctx.request.body
		const queryConditions = []
		if (email) {
			queryConditions.push({ email })
		}
		if (username) {
			queryConditions.push({ username })
		}
		if (phone) {
			queryConditions.push({ phone })
		}
		if (queryConditions.length > 0) {
			try {
				const user = await User.findOne({
					where: {
						[Op.or]: queryConditions,
						id: { [Op.ne]: id }, // 排除当前正在编辑的用户ID
					},
				})
				if (user) {
					if (user.email === email) {
						ctx.throw(400, "邮箱已被注册")
					} else if (user.username === username) {
						ctx.throw(400, "用户名已被注册")
					} else if (user.phone === phone) {
						ctx.throw(400, "手机号已被注册")
					}
				}
			} catch (err) {
				ctx.throw(400, err);
			}
		}
		await next()
	},
}
