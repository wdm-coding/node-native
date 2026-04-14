const fs = require('fs');
const path = require('path');
const forge = require('node-forge');
const pki = forge.pki; // 导钥基础设施模块

// 证书存储目录
const CERT_DIR = path.join(__dirname, '../certs');

// 创建 CA 证书
const createCA = () => {
    if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR); //如果不存在证书目录则创建证书目录

    const caKeyPath = path.join(CERT_DIR, 'ca.key'); // CA 私钥路径
    const caCertPath = path.join(CERT_DIR, 'ca.crt'); // CA 证书路径
    // 1. 生成或加载 CA 证书
    if (fs.existsSync(caKeyPath) && fs.existsSync(caCertPath)){
        const caKeysObj = pki.privateKeyFromPem(fs.readFileSync(caKeyPath));
        const caCertObj = pki.certificateFromPem(fs.readFileSync(caCertPath));
        console.log('✅ CA 证书已加载');
        return {
            caKeysObj: caKeysObj, // 私钥对象 (用于签名)
            caCertObj: caCertObj, // 证书对象
            caKeys: pki.privateKeyToPem(caKeysObj), // 私钥PEM (用于传输/保存)
            caCert: pki.certificateToPem(caCertObj) // 证书PEM
        }
    }else{
        console.log('⚙️ 正在生成 CA 证书...');
        const keys = pki.rsa.generateKeyPair(2048); // 生成 RSA 密钥对
        const caKeys = keys.privateKey; // CA 私钥
        const cert = pki.createCertificate(); // 创建CA证书
        cert.publicKey = keys.publicKey; // CA 公钥
        cert.serialNumber = '01'; // 证书序列号
        cert.validity.notBefore = new Date(); // 证书有效期开始时间
        cert.validity.notAfter = new Date(); // 证书有效期结束时间
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10); // 10年有效期
        const attrs = [{ name: 'commonName', value: 'MyRootCA' }]; // 证书主题属性
        cert.setSubject(attrs); // 设置证书主题属性
        cert.setIssuer(attrs); // 设置证书签发者属性 
        cert.sign(caKeys, forge.md.sha256.create()); // 签名证书
        fs.writeFileSync(caKeyPath, pki.privateKeyToPem(caKeys)); // 保存 CA 私钥
        fs.writeFileSync(caCertPath, pki.certificateToPem(cert)); // 保存 CA 证书
        console.log('✅ CA 证书已生成并保存');
        return {
            caKeysObj: keys.privateKey, // 私钥对象 (用于签名)
            caCertObj: cert, // 证书对象
            caKeys: pki.privateKeyToPem(keys.privateKey), // 私钥PEM (用于传输/保存)
            caCert: pki.certificateToPem(cert) // 证书PEM
        }
    }
}

// 创建服务端证书
const createServerCert = () => {
    if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR); //如果不存在证书目录则创建证书目录
    // 获取 CA 信息用于签名
    const { caKeysObj } = createCA(); 
    // 2. 生成或加载服务端证书
    const servKeyPath = path.join(CERT_DIR, 'server.key'); // 服务端私钥路径
    const servCertPath = path.join(CERT_DIR, 'server.crt'); // 服务端证书路径
    if (!fs.existsSync(servKeyPath) || !fs.existsSync(servCertPath)){
        console.log('⚙️ 正在生成服务端证书...');
        const keys = pki.rsa.generateKeyPair(2048); // 生成 RSA 密钥对
        const cert = pki.createCertificate(); // 创建服务端证书
        cert.publicKey = keys.publicKey; // 服务端公钥
        cert.serialNumber = '02'; // 证书序列号
        cert.validity.notBefore = new Date(); // 证书有效期开始时间
        cert.validity.notAfter = new Date(); // 证书有效期结束时间
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1); // 1年有效期
        cert.setSubject([{ name: 'commonName', value: 'localhost' }]); // 证书主题属性
        cert.setIssuer([{ name: 'commonName', value: 'MyRootCA' }]); // 由 CA 签发
        // 设置基本约束和密钥用法（简化版）
        cert.setExtensions([{ name: 'basicConstraints', cA: false }]); // 基本约束
        cert.sign(caKeysObj, forge.md.sha256.create()); // 签名证书
        fs.writeFileSync(servKeyPath, pki.privateKeyToPem(keys.privateKey)); // 保存服务端私钥
        fs.writeFileSync(servCertPath, pki.certificateToPem(cert)); // 保存服务端证书
        console.log('✅ 服务端证书已生成并保存');
    }
}

// 创建客户端证书
const createClientCert = (userId) => {
    const caData = createCA(); // 获取 CA 数据
    const keys = pki.rsa.generateKeyPair(2048);
    const cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = userId;
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    cert.setSubject([{ name: 'commonName', value: `User-${userId}` }]);
    cert.setIssuer([{ name: 'commonName', value: 'MyRootCA' }]);
    cert.setExtensions([
        { name: 'basicConstraints', cA: false },
        {
            name: 'keyUsage',
            keyCertSign: false,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        }, 
        {
            name: 'extKeyUsage',
            clientAuth: true,
            emailProtection: true
        }
    ]);
    cert.sign(caData.caKeysObj, forge.md.sha256.create());
    return {
        clientKey: pki.privateKeyToPem(keys.privateKey).replace(/\r\n/g, '\n').trim(),
        clientCert: pki.certificateToPem(cert).replace(/\r\n/g, '\n').trim(),
        caCert: caData.caCert.replace(/\r\n/g, '\n').trim() // 返回 CA 证书字符串供客户端信任
    };
}

// 启动时检查并生成 CA 和服务端证书
const initCert = () => {
    createCA();
    createServerCert();
}

module.exports = {
    initCert,
    createCA,
    createServerCert,
    createClientCert
}