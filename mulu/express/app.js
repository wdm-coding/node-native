const express = require('express');
const https = require('https');
const db = require('./models'); // 引入模型入口，触发数据库连接和同步
const Router = require('./router/index'); // 引入路由聚合
const app = express();
const cors = require('cors'); // 引入跨域中间件
const morgan = require('morgan'); // 引入日志记录中间件
const { initCert } = require('./config/ssl.js'); // 引入证书管理类
initCert(); // 初始化证书

// app.use应用程序中间件
app.use((req,res,next)=>{next()})

// 中间件：解析application/x-www-form-urlencoded格式的请求体
app.use(express.urlencoded({ extended: true })); // extended: true 解析复杂对象
// 中间件：解析JSON格式的请求体
app.use(express.json());

// 跨域中间件cors
app.use(cors());

// 日志记录中间件morgan
app.use(morgan('dev'));

// 处理静态文件的中间件
app.use(express.static('uploads')); // 将 uploads 目录设置为静态文件目录

// 路由中间件
app.use('/api',Router)

// 处理404错误中间件
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// 处理500错误中间件
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('服务器内部错误');
});

// 启动 HTTPS 服务器
// 读取服务端证书
const path = require('path');
const fs = require('fs');
const CERT_DIR = path.join(__dirname, './certs');
const serverOptions = {
  key: fs.readFileSync(path.join(CERT_DIR, 'server.key')),
  cert: fs.readFileSync(path.join(CERT_DIR, 'server.crt')),
  ca: fs.readFileSync(path.join(CERT_DIR, 'ca.crt')), // 信任的 CA，用于验证客户端
  requestCert: true,        // 请求客户端证书
  rejectUnauthorized: false // 设为 false，因为我们要在中间件中手动处理验证逻辑，而不是直接由 Node.js 拒绝连接
};
const server = https.createServer(serverOptions, app);

// 在启动服务器前先同步数据库
db.sync().then(() => {
    console.log('模型同步成功，准备启动服务器...');
    // 启动服务器
    server.listen(3000, () => {
      console.log('服务启动成功，端口 3000 https://localhost:3000');
    });
}).catch((err) => {
    console.error('数据库同步失败:', err);
});