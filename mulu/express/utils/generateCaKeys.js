const forge = require('node-forge');
const fs = require('fs');
const path = require('path');
try {
  // 生成新的 RSA 密钥对
  // keySize: 密钥长度，2048 或 4096 是常见的选择，4096 更安全但稍慢
  // workerCount: 用于并行计算的 Web Workers 数量 (可选，提高性能)
  const keys = forge.pki.rsa.generateKeyPair({
    bits: 4096, // 推荐使用 4096 位以获得更好的安全性
    // workerCount: -1 // 使用所有可用的 CPU 核心 (可选)
  });

  // 获取私钥 (Private Key)
  const privateKey = keys.privateKey;

  // 获取公钥 (Public Key)
  const publicKey = keys.publicKey;

  console.log("生成成功!");
  // 2. 创建自签名的 CA 证书
  const caCert = forge.pki.createCertificate();
  // 设置证书的公钥（使用上面生成的公钥）
  caCert.publicKey = publicKey;
  // 设置证书的序列号（CA 证书的唯一标识）
  caCert.serialNumber = '01'; // 对于根 CA，通常用一个简单的值
  // 设置证书的有效期
  caCert.validity.notBefore = new Date(); // 当前时刻开始生效
  caCert.validity.notAfter = new Date();
  caCert.validity.notAfter.setFullYear(caCert.validity.notBefore.getFullYear() + 10); // 有效期 10 年
  // 设置证书的主题 (Subject) 和颁发者 (Issuer)
  // 对于根 CA，主题和颁发者是相同的
  const caSubjectAndIssuerAttrs = [
    { name: 'countryName', value: 'CN' },       // 国家
    { name: 'stateOrProvinceName', value: 'GAN SU' }, // 州/省
    { name: 'localityName', value: 'LAN ZHOU' },    // 城市/地区
    { name: 'organizationName', value: 'WDM EXPRESS' }, // 组织名称
    { name: 'organizationalUnitName', value: 'WDM XZ' }, // 组织单位
    { name: 'commonName', value: 'WDM EXPRESS CA' }           // 通用名称 (CN) - 这是 CA 的名字
  ];

  caCert.setSubject(caSubjectAndIssuerAttrs);
  caCert.setIssuer(caSubjectAndIssuerAttrs); // 自签名，所以颁发者就是自己
  // 添加证书扩展 (Extensions) - 对于 CA 至关重要
  caCert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true, // 关键：表明这是一个 CA 证书
      pathLenConstraint: 0 // 可选：限制此 CA 下最多能再签发几层子 CA (0 表示只能签发最终实体证书)
    },
    {
      name: 'keyUsage',
      keyCertSign: true, // 关键：允许使用此密钥来签署其他证书
      cRLSign: true      // 允许使用此密钥来签署证书吊销列表 (CRL)
    },
    {
      name: 'subjectKeyIdentifier' // 添加主题密钥标识符
    }
  ]);
  // 使用 CA 的私钥对证书进行签名
  caCert.sign(privateKey, forge.md.sha256.create()); // 使用 SHA-256 哈希算法签名

  // 3. 将私钥、公钥、和 CA 证书转换为 PEM 格式
  // 将私钥转换为 PEM 格式字符串
  const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
  // 将公钥转换为 PEM 格式字符串
  const publicKeyPem = forge.pki.publicKeyToPem(publicKey);
  // 将 CA 证书转换为 PEM 格式字符串
  const caCertPem = forge.pki.certificateToPem(caCert);
  
  // 在实际应用中，你需要将 privateKeyPem 和 publicKeyPem 保存到安全的文件中
  fs.writeFileSync(path.join(__dirname, '../ca/ca-key.pem'), privateKeyPem); // 一定要保护好这个文件！
  fs.writeFileSync(path.join(__dirname, '../ca/ca-pubkey.pem'), publicKeyPem); // 公钥可以公开，但通常不需要单独保存
  fs.writeFileSync(path.join(__dirname, '../ca/ca-cert.pem'), caCertPem); // CA 证书可以公开，但通常不需要单独保存
} catch (error) {
  console.error("生成密钥对时出错:", error);
}