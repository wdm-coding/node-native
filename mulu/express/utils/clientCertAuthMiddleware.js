// 自定义的证书验证中间件
function clientCertAuthMiddleware(req, res, next){
  // 1. 获取客户端证书
  const clientCert = req.socket.getPeerCertificate();
  if (!clientCert || Object.keys(clientCert).length === 0) {
    return res.status(401).json({ error: '客户端证书缺失' });
  }
  // 2. 检查证书是否有效 (rejectUnauthorized=true 已经做了大部分工作)
  if (clientCert.valid_to && new Date(clientCert.valid_to) < new Date()) {
    return res.status(401).json({ error: '客户端证书已过期' });
  }
  console.log('clientCert:', clientCert);
  // 5. 验证通过，继续处理请求
  next();
}

module.exports = clientCertAuthMiddleware;