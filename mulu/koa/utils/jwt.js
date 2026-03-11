const jwt = require("jsonwebtoken")
const { secret } = require("../config/index")
const { promisify } = require("util")
const tojwt = promisify(jwt.sign)
const verifyJwt = promisify(jwt.verify)
const { failBack } = require("../utils/backBody")
const { Cash } = require("../models")
// 生成 JWT token
async function generateToken(payload, expiresIn = "24h") {
	return await tojwt(payload, secret, { expiresIn })
}

// 验证 JWT token
function verifyToken(isRequired = true) {
	return async (ctx, next) => {
		let token = ctx.request.headers["authorization"]
		token = token ? token.split("Bearer ")[1] : null
		if (token) {
			try {
				const decoded = await verifyJwt(token, secret)
				const tokenVersion = decoded.tokenVersion
				const { tokenVersion: tokenV } = await Cash.findOne({ where: { userId: decoded.id } })
				if (tokenVersion !== Number(tokenV)) {
					failBack(ctx, { message: "token 已过期" }, {code:-2,status: 401})
					return
				}
				ctx.user = decoded
				await next()
			} catch (error) {
				const { name, message } = error
				if (name === "TokenExpiredError") {
					failBack(ctx, { message: "token 已过期" }, {code:-2,status: 401})
					return 
				} else {
					failBack(ctx, { message: message || "token 无效" }, {code:1,status: 401})
					return 
				}
			}
		}else{
			if(isRequired) {
				failBack(ctx, { message: "用户未登录" }, {code:-2,status: 401})
			}else{
				await next()
			}
		}
	}
}

module.exports = {
	generateToken,
	verifyToken,
}
