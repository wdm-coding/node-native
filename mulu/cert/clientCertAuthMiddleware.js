// 一个自定义的证书验证中间件
function clientCertAuthMiddleware(req, res, next) {
  // 1. 获取客户端证书
  const clientCert = req.socket.getPeerCertificate();

  // 2. 检查证书是否存在
  if (!clientCert || Object.keys(clientCert).length === 0) {
    return res.status(401).json({ error: '客户端证书缺失' });
  }

  // 3. 检查证书是否有效 (rejectUnauthorized=true 已经做了大部分工作)
  if (clientCert.valid_to && new Date(clientCert.valid_to) < new Date()) {
     return res.status(401).json({ error: '客户端证书已过期' });
  }

  // 4. 在此处添加你的业务逻辑
  // 例如：检查证书的 CN (通用名) 是否是允许的用户
  const username = clientCert.subject.CN;
  if (username !== 'Test User') {
    return res.status(403).json({ error: '该证书未被授权访问此资源' });
  }

  // 5. 将用户信息附加到请求对象上，供后续路由使用
  req.user = {
    name: username,
    organization: clientCert.subject.O
  };

  // 6. 验证通过，继续处理请求
  next();
}

module.exports = clientCertAuthMiddleware;