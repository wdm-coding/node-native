const fs = require('fs');
const forge = require('node-forge');
const path = require('path');
//  加载 CA 证书和私钥
const caCertPem = fs.readFileSync(path.join(__dirname, '../ca/ca-cert.pem'), 'utf8');
const caKeyPem = fs.readFileSync(path.join(__dirname, '../ca/ca-key.pem'), 'utf8');
//  从 PEM 格式加载 CA 证书和私钥
const caCert = forge.pki.certificateFromPem(caCertPem);
const caPrivateKey = forge.pki.privateKeyFromPem(caKeyPem);

// 在生产环境中，请使用分配给你组织的正确 OID。
const USER_ID_OID = '1.2.3.4.5.6.7.8.10'; // 替换为你组织的 OID

// 签发用户证书
async function signUserCertificate(csr, userId) {
    // 验证 CSR 签名
    if (!csr.verify()) {
        throw new Error('CSR 签名无效.');
    }

    // --- 关键步骤：验证 CSR 主题 (Subject) 是否与经过身份验证的用户 ID 匹配 ---
    // 这假设 CSR 的通用名称 (CN) 或另一个属性包含了用户 ID。
    // 根据你期望 CSR 构建的方式调整下面的逻辑。
    const csrSubjectAttrs = csr.subject.attributes;
    // 查找 CSR 中的 Common Name (CN) 字段，这里用作用户 ID 的存放位置
    const csrUserIdAttr = csrSubjectAttrs.find(attr => attr.name === 'commonName'); 

    // 检查找到的 CN 字段值是否与传入的 userId 匹配
    if (!csrUserIdAttr || String(csrUserIdAttr.value) !== String(userId)) {
        console.error(`CSR 主题中的用户标识 (${csrUserIdAttr ? csrUserIdAttr.value : '未找到'}) 与经过身份验证的用户 ID (${userId}) 不匹配。`);
        throw new Error('CSR 主题中的用户标识与经过身份验证的用户 ID 不匹配。可能存在安全违规行为。');
    }


    // 创建用户证书
    const userCert = forge.pki.createCertificate();
    userCert.publicKey = csr.publicKey; // 使用 CSR 中的公钥

    // 生成唯一的证书序列号（简单起见，使用时间戳，确保在生产环境中唯一）
    userCert.serialNumber = Date.now().toString();

    // 设置证书有效期（例如，1 年）
    userCert.validity.notBefore = new Date();
    userCert.validity.notAfter = new Date();
    userCert.validity.notAfter.setFullYear(userCert.validity.notBefore.getFullYear() + 1);

    // 设置证书的主题 (Subject)，使用已验证过的 CSR 主题
    userCert.setSubject(csrSubjectAttrs);

    // 设置证书的签发者 (Issuer) 为 CA 的主题
    userCert.setIssuer(caCert.subject.attributes);

    // 准备证书扩展，包括自定义的 userId 扩展
    const extensions = [
        {
            name: 'basicConstraints', // 基本约束扩展
            cA: false // 此证书不是 CA 证书
        },
        {
            name: 'keyUsage', // 密钥用途扩展
            digitalSignature: true, // 支持数字签名
            keyEncipherment: true // 支持密钥加密 (或 keyAgreement)
        },
        {
            name: 'extKeyUsage', // 扩展密钥用途扩展
            clientAuth: true // 此证书用于客户端身份验证
        }
    ];

    // --- 将 UserId 嵌入到自定义扩展中 (可选但推荐) ---
    // 将 userId 字符串转换为十六进制字节，用于 ASN.1 值
    const userIdBytes = forge.util.encodeUtf8(String(userId)); // 确保它是字符串
    const userIdValueHex = Buffer.from(userIdBytes).toString('hex');

    // 添加自定义扩展
    extensions.push({
        name: 'userId',    // 扩展的描述性名称
        id: USER_ID_OID,         // 此扩展的唯一 OID
        critical: false,         // 自定义字段通常不设为关键
        value: userIdValueHex    // userId 的十六进制编码值
    });

    // 设置准备好的扩展
    userCert.setExtensions(extensions);

    // 记录成功签发日志（包含用户 ID）
    console.log(`[INFO] 已为用户 ID: ${userId} 签发证书`);

    // 使用 CA 的私钥签署用户证书
    userCert.sign(caPrivateKey, forge.md.sha256.create());
    // 转换为 PEM 格式并返回
    return forge.pki.certificateToPem(userCert);
}


module.exports = { signUserCertificate };