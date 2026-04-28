const jwt = require("jsonwebtoken")
const { secret } = require("../config/index")
const { promisify } = require("util")
const tojwt = promisify(jwt.sign)
const verifyJwt = promisify(jwt.verify)
const { Cash } = require("../models")
// 生成 JWT token
async function generateToken(payload, expiresIn = "24h") {
	return await tojwt(payload, secret, { expiresIn })
}

// 验证 JWT token
function verifyToken(isRequired = true) {
	return async (req, res, next) => {
		let token = req.headers["authorization"]
		token = token ? token.split("Bearer ")[1] : null
		if (token) {
			try {
				const decoded = await verifyJwt(token, secret)
				const tokenVersion = decoded.tokenVersion
				const { tokenVersion: tokenV } = await Cash.findOne({ where: { userId: decoded.id } })
				if (tokenVersion !== Number(tokenV)) {
					return res.status(401).json({
						code: -2,
						message: "token 已过期",
					})
				}
				req.user = decoded
				next()
				return
			} catch (error) {
				const { name, message } = error
				if (name === "TokenExpiredError") {
					return res.status(401).json({
						code: -2,
						message: "token 已过期",
					})
				} else {
					return res.status(401).json({
						code: 1,
						message: message || "token 无效",
					})
				}
			}
		}else{
			if(isRequired) {
				return res.status(200).json({
					code: -2,
					message: "用户未登录",
				})
			}else{
				next()
				return
			}
		}
	}
}

module.exports = {
	generateToken,
	verifyToken,
}
