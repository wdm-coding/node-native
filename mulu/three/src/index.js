// 1. 引入http模块
const http = require('http');
// 2. 创建服务器
const server = http.createServer();

// 3. 启动服务器
server.listen(3000, () => {
    const url = `http://localhost:3000`;
    console.log('服务已启动，监听端口：3000',url);
});

// 4. 监听请求事件
const router = require('./modules/router');
server.on('request', (req, res)=>{
    router(req, res);
});