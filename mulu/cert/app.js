const express = require('express');
const fs = require('fs');
const https = require('https');

const app = express();
const clientCertAuthMiddleware = require('./clientCertAuthMiddleware');
// 1. 读取证书文件
const caCert = fs.readFileSync('./zs/ca.crt'); // CA证书，用于验证客户端
const serverKey = fs.readFileSync('./zs/server.key'); // 服务器私钥
const serverCert = fs.readFileSync('./zs/server.crt'); // 服务器证书

// 2. 配置 HTTPS 服务器选项
const httpsOptions = {
  key: serverKey,
  cert: serverCert,
  ca: caCert, // 指定用于验证客户端证书的CA
  requestCert: true, // 关键：要求客户端提供证书
  rejectUnauthorized: false // 关键：改为 false，允许未认证的连接建立
};

// 3. 创建 HTTPS 服务器
const server = https.createServer(httpsOptions, app);

// 4. 定义路由
app.get('/api/', (req, res) => {
  // 如果请求能到达这里，说明客户端证书已经通过了初步验证
  res.send('Hello, secure world! 客户端连接成功，无需提供证书。');
});

app.get('/api/protected', clientCertAuthMiddleware, (req, res) => {
  const user = req.user;
  if (user && user.name) {
    res.json({
      message: '欢迎访问受保护的资源',
      user: user.name, // 例如，获取证书中的通用名
      issuer: user.organization
    });
  } else {
    res.status(403).send('无法获取客户端证书信息');
  }
});

// 5. 启动服务器
server.listen(3000, () => {
  console.log('HTTPS Server is running on port 3000');
});