// cert-manager.js
const forge = require("node-forge")
const fs = require("fs")
const path = require("path")

class CertificateManager {
	constructor(certsDir = "../certs") {
		this.pki = forge.pki // 初始化PKI模块
		this.md = forge.md // 初始化md模块
		this.rsa = forge.pki.rsa // 初始化RSA模块
		this.certsDir = path.resolve(__dirname, certsDir) // 证书目录
		// 确保证书目录存在
		if (!fs.existsSync(this.certsDir)) {
			fs.mkdirSync(this.certsDir, { recursive: true })
		}
		// 初始化根证书
		this.caCert = null // CA证书
		this.caPrivateKey = null // CA私钥
		this.serverCert = null // 服务器证书
		this.serverKey = null // 服务器私钥
		this.initializeCertificates()
	}

	// 初始化证书（如果不存在则生成）
	initializeCertificates() {
		const caCertPath = path.join(this.certsDir, "ca.crt") // CA证书路径
		const caKeyPath = path.join(this.certsDir, "ca.key") // CA私钥路径
		const serverCertPath = path.join(this.certsDir, "server.crt") // 服务器证书路径
		const serverKeyPath = path.join(this.certsDir, "server.key") // 服务器私钥路径
		// 生成CA证书（如果不存在）
		if (!fs.existsSync(caCertPath) || !fs.existsSync(caKeyPath)) {
			console.log("生成CA证书...")
			const ca = this.generateCA()
			fs.writeFileSync(caCertPath, ca.certificate) // 保存CA证书
			fs.writeFileSync(caKeyPath, ca.privateKey) // 保存CA私钥
			console.log("CA证书生成完成")
		}

		// 生成服务器证书（如果不存在）
		if (!fs.existsSync(serverCertPath) || !fs.existsSync(serverKeyPath)) {
			console.log("生成服务器证书...")
			const caCert = fs.readFileSync(caCertPath, "utf8") // 读取CA证书
			const caPrivateKey = fs.readFileSync(caKeyPath, "utf8") // 读取CA私钥
			const server = this.generateServerCert(caCert, caPrivateKey) // 生成服务器证书
			fs.writeFileSync(serverCertPath, server.certificate) // 保存服务器证书
			fs.writeFileSync(serverKeyPath, server.privateKey) // 保存服务器私钥
			console.log("服务器证书生成完成")
		}

		// 加载证书
		this.caCert = fs.readFileSync(caCertPath, "utf8") // 读取CA证书
		this.caPrivateKey = fs.readFileSync(caKeyPath, "utf8") // 读取CA私钥
		this.serverCert = fs.readFileSync(serverCertPath, "utf8") // 读取服务器证书
		this.serverKey = fs.readFileSync(serverKeyPath, "utf8") // 读取服务器私钥
	}

	// 生成CA证书
	generateCA() {
		// 生成密钥对
		const keys = this.rsa.generateKeyPair(2048)
		// 创建证书
		const cert = this.pki.createCertificate() // 创建证书对象
		cert.publicKey = keys.publicKey // 设置公钥
		cert.serialNumber = "01" + Date.now().toString() // 设置证书序列号
		// 设置证书主题和颁发者（对于CA来说是相同的）
		cert.setSubject([
			{
				name: "commonName",
				value: "My CA",
			},
			{
				name: "countryName",
				value: "CN",
			},
			{
				name: "stateOrProvinceName",
				value: "GanSu",
			},
			{
				name: "localityName",
				value: "LanZhong",
			},
			{
				name: "organizationName",
				value: "WDM",
			},
		])
		cert.setIssuer(cert.subject.attributes) // 自签名
		// 设置有效期
		cert.validity.notBefore = new Date()
		cert.validity.notAfter = new Date()
		cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + 365) // 一年有效期
		// 设置扩展
		cert.setExtensions([
			{
				name: "basicConstraints",
				cA: true,
				pathLenConstraint: 10,
			},
			{
				name: "keyUsage",
				keyCertSign: true,
				cRLSign: true,
				digitalSignature: true,
				keyEncipherment: true,
				dataEncipherment: true,
			},
			{
				name: "subjectKeyIdentifier",
			},
		])
		// 签名证书
		cert.sign(keys.privateKey, this.md.sha256.create())
		return {
			privateKey: this.pki.privateKeyToPem(keys.privateKey), // ca私钥转换为PEM格式
			publicKey: this.pki.publicKeyToPem(keys.publicKey), // ca公钥转换为PEM格式
			certificate: this.pki.certificateToPem(cert), // ca证书转换为PEM格式
		}
	}

	// 生成服务器证书
	generateServerCert(caCert, caPrivateKey) {
		// 生成服务器密钥对
		const keys = this.rsa.generateKeyPair(2048)
		// 解析CA证书和私钥
		const caCertObj = this.pki.certificateFromPem(caCert) // 解析CA证书
		const caPrivateKeyObj = this.pki.privateKeyFromPem(caPrivateKey) // 解析CA私钥
		// 创建服务器证书
		const cert = this.pki.createCertificate() // 创建证书对象
		cert.publicKey = keys.publicKey // 设置公钥
		cert.serialNumber = Date.now().toString() // 唯一序列号
		// 设置证书主题
		cert.setSubject([
			{
				name: "commonName",
				value: "localhost",
			},
			{
				name: "countryName",
				value: "CN",
			},
			{
				name: "stateOrProvinceName",
				value: "GanSu",
			},
			{
				name: "localityName",
				value: "LanZhong",
			},
			{
				name: "organizationName",
				value: "WDM",
			},
		])
		// 设置颁发者（CA）
		cert.setIssuer(caCertObj.subject.attributes)
		// 设置有效期
		cert.validity.notBefore = new Date()
		cert.validity.notAfter = new Date()
		cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + 365) // 一年有效期
		// 设置扩展
		cert.setExtensions([
			{
				name: "basicConstraints",
				cA: false,
			},
			{
				name: "keyUsage",
				digitalSignature: true,
				keyEncipherment: true,
			},
			{
				name: "extKeyUsage",
				serverAuth: true,
			},
			{
				name: "subjectAltName",
				altNames: [
					{
						type: 2, // DNS
						value: "localhost",
					},
					{
						type: 7, // IP
						ip: "127.0.0.1",
					},
				],
			},
		])
		// 签名证书
		cert.sign(caPrivateKeyObj, this.md.sha256.create())
		return {
			privateKey: this.pki.privateKeyToPem(keys.privateKey), // 服务器私钥转换为PEM格式
			certificate: this.pki.certificateToPem(cert), // 服务器证书转换为PEM格式
		}
	}

	// 生成客户端证书
	generateClientCert(clientInfo) {
		console.log(`为 ${clientInfo.username} 生成客户端证书...`)
		// 生成客户端密钥对
		const keys = this.rsa.generateKeyPair(2048)
		// 解析CA证书和私钥
		const caCertObj = this.pki.certificateFromPem(this.caCert) // 解析CA证书
		const caPrivateKeyObj = this.pki.privateKeyFromPem(this.caPrivateKey) // 解析CA私钥
		// 创建客户端证书
		const cert = this.pki.createCertificate() // 创建证书对象
		cert.publicKey = keys.publicKey // 设置公钥
		cert.serialNumber = Date.now().toString() // 唯一序列号
		// 设置证书主题
		cert.setSubject([
			{
				name: "commonName",
				value: clientInfo.userId,
			},
			{
				name: "countryName",
				value: "CN",
			},
			{
				name: "stateOrProvinceName",
				value: "GanSu",
			},
			{
				name: "localityName",
				value: "LanZhong",
			},
			{
				name: "organizationName",
				value: clientInfo.username || "WDM",
			},
		])
		// 设置颁发者（CA）
		cert.setIssuer(caCertObj.subject.attributes) // 设置颁发者为CA证书主题
		// 设置有效期
		cert.validity.notBefore = new Date()
		cert.validity.notAfter = new Date()
		cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + 365) // 一年有效期
		// 设置扩展
		cert.setExtensions([
			{
				name: "basicConstraints",
				cA: false,
			},
			{
				name: "keyUsage",
				digitalSignature: true,
				keyEncipherment: true,
			},
			{
				name: "extKeyUsage",
				clientAuth: true,
			},
		])
		// 签名证书
		cert.sign(caPrivateKeyObj, this.md.sha256.create())
		// 生成PKCS#12 (P12) 格式证书
		const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
			keys.privateKey,
			[cert], // 证书链
			"123456", // 密码 - 在实际应用中应该使用动态密码
			{
				generateLocalKeyId: true, // 生成本地密钥ID
				friendlyName: clientInfo.userId, // 证书别名
			},
		)
		// 转换为DER编码
		const p12Der = forge.asn1.toDer(p12Asn1).getBytes()
		return {
			privateKey: this.pki.privateKeyToPem(keys.privateKey), // 客户端私钥转换为PEM格式
			certificate: this.pki.certificateToPem(cert), // 客户端证书转换为PEM格式
			p12: Buffer.from(p12Der, "binary"), // 转换为Buffer
			username: clientInfo.username, // 客户端用户名
		}
	}

	// 获取服务器HTTPS选项
	getHttpsOptions() {
		return {
			key: this.serverKey,
			cert: this.serverCert,
			ca: [this.caCert],
			requestCert: true, // 请求客户端证书
			rejectUnauthorized: false, // 我们将在应用层处理证书验证
		}
	}

	// 获取CA证书
	getCACert() {
		return this.caCert
	}

	// 获取服务器证书
	getServerCert() {
		return this.serverCert
	}

	// 获取服务器密钥
	getServerKey() {
		return this.serverKey
	}
	// 添加提取用户ID的方法
	extractUserIdFromCert(clientCert) {
		// 从证书主题中提取用户ID (CN字段)
		if (clientCert.subject && clientCert.subject.CN) {
			return clientCert.subject.CN
		} else if (clientCert.subject && typeof clientCert.subject.getField === "function") {
			const cnField = clientCert.subject.getField("CN")
			if (cnField) {
				return cnField.value
			}
		} else if (typeof clientCert.subject === "string") {
			// 从字符串形式的主题中提取CN
			const match = clientCert.subject.match(/CN=([^,]+)/)
			if (match) {
				return match[1]
			}
		}
		return null
	}
}

module.exports = CertificateManager
