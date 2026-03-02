const jwt = require('jsonwebtoken');
const {secret} = require('../config/index');
const { promisify } = require('util')
const tojwt = promisify(jwt.sign);
const verifyJwt = promisify(jwt.verify);
const {Cash} = require('../models');
// 生成 JWT token
async function generateToken(payload, expiresIn = '24h') {
  return await tojwt(payload, secret, { expiresIn });
}

// 验证 JWT token
async function verifyToken(req, res, next) {
  let token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ 
      code: -2, 
      message: '用户未登录' 
    });
  }
  token = token.split('Bearer ')[1];
  try {
    const decoded = await verifyJwt(token, secret);
    const tokenVersion = decoded.tokenVersion;
    const {tokenVersion:tokenV} = await Cash.findOne({ where: { id:1 } });
    if(tokenVersion !== Number(tokenV)) {
      return res.status(401).json({ 
        code: -2,
        message: 'token 已过期' 
      });
    }
    req.user = decoded;
    next();
  } catch (error) {
    const { name, message } = error;
    if(name === 'TokenExpiredError'){
      return res.status(401).json({ 
        code: -2,
        message: 'token 已过期' 
      });
    }else{
      return res.status(401).json({ 
        code: 1, 
        message: message || 'token 无效'
      });
    }
  }
}

module.exports = {
  generateToken,
  verifyToken
};