const CertificateManager = require('../config/ssl');
const certManager = new CertificateManager();
const User = require('../models/user');
// 证书验证中间件
const verifyClientCert = async (req, res, next) => {
    try {
       // 尝试从连接获取对等证书
        if (!req.client || !req.client.cert) {
            if (req.connection && typeof req.connection.getPeerCertificate === 'function') {
                const peerCert = req.connection.getPeerCertificate(true);
                if (peerCert && Object.keys(peerCert).length > 0) {
                    req.client = req.client || {};
                    req.client.cert = peerCert;
                }
            }
        }
        // 检查是否有客户端证书
        if (!req.client || !req.client.cert) {
            return res.status(500).json({
                code:1,
                success: false,
                message: '客户端证书缺失',
                debug: {
                    connectionAuthorized: req.connection?.authorized,
                    authorizationError: req.connection?.authorizationError,
                    hasPeerCertificate: !!(req.connection && typeof req.connection.getPeerCertificate === 'function')
                }
            });
        }
        const clientCert = req.client.cert;
        // 从证书中提取用户ID
        const userId = certManager.extractUserIdFromCert(clientCert);
        // 检查用户是否存在
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(500).json({
                code:1,
                success: false,
                message: '用户不存在'
            });
        }
        // 将用户信息附加到请求对象
        req.user = user;
        next();
    } catch (error) {
        console.error('证书验证错误:', error);
        return res.status(500).json({
            code:1,
            success: false,
            message: '证书验证过程中发生错误'
        });
    }
};

module.exports = verifyClientCert;
