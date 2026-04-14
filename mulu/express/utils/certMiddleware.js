const CertificateManager = require('../config/ssl');
const certManager = new CertificateManager();
// 证书验证中间件
const verifyClientCert = async (req, res, next) => {
    try {
        // 检查是否有客户端证书
        if (!req.client || !req.client.cert) {
            return res.status(401).json({
                success: false,
                message: '客户端证书缺失'
            });
        }
        const clientCert = req.client.cert;
        // 验证证书是否由我们的CA签发
        const isValid = certManager.verifyCertificate(
            certManager.pki.certificateToPem(clientCert),
            certManager.getCACert()
        );
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: '无效的客户端证书'
            });
        }
        // 从证书中提取用户ID
        const userId = certManager.extractUserIdFromCert(clientCert);
        // 检查用户是否存在
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(401).json({
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
            success: false,
            message: '证书验证过程中发生错误'
        });
    }
};

module.exports = verifyClientCert;
