const express = require('express');
const https = require('https');
const db = require('./models'); // 引入模型入口，触发数据库连接和同步
const Router = require('./router/index'); // 引入路由聚合
const app = express();
const cors = require('cors'); // 引入跨域中间件
const morgan = require('morgan'); // 引入日志记录中间件
const fs = require('fs'); // 引入文件系统模块，用于读取证书文件
const path = require('path'); // 引入路径模块，用于处理文件路径
// 1. 读取证书文件
const caCert = fs.readFileSync(path.join(__dirname, './ca/ca-cert.pem')); // CA证书，用于验证客户端
const serverKey = fs.readFileSync(path.join(__dirname, './ca/server-key.pem')); // 服务器私钥
const serverCert = fs.readFileSync(path.join(__dirname, './ca/server-cert.pem')); // 服务器证书

// 2. 配置 HTTPS 服务器选项
const httpsOptions = {
  key: serverKey,
  cert: serverCert,
  ca: caCert, // 指定用于验证客户端证书的CA
  requestCert: true, // 关键：要求客户端提供证书
  rejectUnauthorized: false // 关键：改为 false，允许未认证的连接建立
};



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


// 3. 创建 HTTPS 服务器
const server = https.createServer(httpsOptions, app);
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