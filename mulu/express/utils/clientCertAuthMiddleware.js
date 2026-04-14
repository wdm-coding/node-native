// 自定义的证书验证中间件
const clientCertAuthMiddleware = (req, res, next) => {
    const clientCert = req.connection.getPeerCertificate();
    // 1. 检查是否提供了证书
    if (!clientCert || Object.keys(clientCert).length === 0) {
        return res.status(401).json({ error: '未提供客户端证书' });
    }

    // 2. 检查证书是否由我们的 CA 签发 (验证签名)
    try {
        // 简单验证：检查颁发者是否是我们
        if (clientCert.issuer.commonName !== 'MyRootCA') {
             return res.status(403).json({ error: '证书颁发者不受信任' });
        }
    } catch (e) {
        return res.status(403).json({ error: '证书验证失败' });
    }

    // 3. 提取用户信息 (我们在生成证书时放入了 User-ID)
    const subject = clientCert.subject;
    const commonName = subject.commonName; // 格式为 "User-1001"
    if (!commonName.startsWith('User-')) {
        return res.status(400).json({ error: '证书格式错误，缺少用户标识' });
    }
    const userId = commonName.split('-');
    req.certUserId = userId; // 将用户ID挂载到请求对象上
    console.log(`✅ 证书验证通过，用户ID: ${userId}`);
    next();
}

module.exports = clientCertAuthMiddleware;