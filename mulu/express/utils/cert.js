// utils/cert.js
const fs = require('fs');
// const { pkcs12, X509Certificate } = require('node:crypto'); // 注释掉原生 crypto
const forge = require('node-forge'); // 引入 node-forge

const FIXED_P12_PASSPHRASE = '123456'; // 固定的 P12 密码

/**
 * 解析 PKCS#12 (.p12/.pfx) 文件
 * @param {string} filePath - .p12 文件的路径
 * @returns {Object} 解析出的证书和密钥信息
 */
function parseP12FromFile(filePath) {
  const p12Buffer = fs.readFileSync(filePath);
  return parseP12(p12Buffer, FIXED_P12_PASSPHRASE);
}

/**
 * 解析 PKCS#12 (.p12/.pfx) 文件
 * @param {Buffer} p12Buffer - .p12 文件的原始二进制数据
 * @param {string} passphrase - .p12 文件的密码
 * @returns {Object} 解析出的证书和密钥信息
 */
function parseP12(p12Buffer, passphrase) {
  try {
    console.log('Attempting to parse P12 file with node-forge...');

    // 将 Buffer 转换为 forge 可处理的格式
    const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
    
    // 解析 P12
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase);
    
    const bags = p12.getBags({ bagType: forge.pki.oids.certBag }); // 获取证书
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag }); // 获取私钥
    
    const results = [];
    
    // 处理主证书 (通常 bags[forge.pki.oids.certBag] 包含一个或多个证书)
    if (bags && bags[forge.pki.oids.certBag]) {
      bags[forge.pki.oids.certBag].forEach((certBag, index) => {
        const cert = certBag.cert;
        const certInfo = getCertDetailsForge(cert);
        results.push({
          type: 'certificate', // Main certificate
          alias: index === 0 ? 'main_cert' : `cert_${index}`, // 第一个通常是主证书
          ...certInfo
        });
      });
    }
    
    // 处理 CA 证书 (如果有的话，它们也可能在 certBag 中，或者有特定的 CA 类型)
    // 这里我们假设所有在 certBag 中的非主证书都是 CA 证书，可以根据需要调整逻辑
    // 如果有特定的 CA 证书查找方法，可以在这里实现
    
    // 处理私钥 (如果有需要)
    if (keyBags && keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]) {
        const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0]; // 通常只有一个私钥
        if(keyBag) {
            const privateKey = keyBag.key; // forge 私钥对象
            console.log(`Private Key Type: ${privateKey.n ? 'RSA' : 'Other'}, Size: ${privateKey.n ? Math.floor(privateKey.n.bitLength() / 8) * 8 : 'N/A'} bits (approx from modulus length)`);
            // 注意：不要将实际的私钥材料返回给前端！
            // results.push({ type: 'private_key', ... }) // 一般不会返回私钥详情
        }
    }


    return results;
  } catch (error) {
    console.error('Failed to parse PKCS#12 file with node-forge:', error.message);
    throw error; // Re-throw so calling function can catch it
  }
}

/**
 * Helper to get common details from a forge certificate object
 * @param {forge.pki.Certificate} certObj - forge 证书对象
 * @returns {Object}
 */
function getCertDetailsForge(certObj) {
  // forge 证书对象的属性与 Node.js X509Certificate 不同
  return {
    subject: certObj.subject.attributes.map(attr => `${attr.name}=${attr.value}`).join(', '), // 转换为类似 X509 的字符串
    issuer: certObj.issuer.attributes.map(attr => `${attr.name}=${attr.value}`).join(', '),  // 转换为类似 X509 的字符串
    validFrom: certObj.validity.notBefore.toISOString(), // 转换为 ISO 字符串
    validTo: certObj.validity.notAfter.toISOString(),   // 转换为 ISO 字符串
    serialNumber: certObj.serialNumber, // 通常是十六进制字符串
    // 计算 SHA-256 指纹
    fingerprint256: forge.md.sha256.create().update(forge.asn1.toDer(forge.pki.certificateToAsn1(certObj)).getBytes()).digest().toHex().toUpperCase(),
  };
}

module.exports = { parseP12FromFile, parseP12 };