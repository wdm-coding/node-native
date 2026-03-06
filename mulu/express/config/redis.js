const Redis = require('ioredis')
const redisClient = new Redis({
    host: 'r-bp1gf0jpeextgbkojgpd.redis.rds.aliyuncs.com',// 阿里云 Redis 实例公网访问地址
    port: 6379,
    password: 'auth r-bp1gf0jpeextgbkojg:wdm-redis0620', // auth 账号:密码
    db: 0, // 使用哪个数据库，默认为0 Redis 默认有16个数据库，编号从0到15
    connectTimeout: 30000, // 连接超时时间 (毫秒)
    commandTimeout: 30000, // 命令执行超时时间 (毫秒)
    lazyConnect: true, // 延迟连接，即创建实例时不立刻连接
});
redisClient.on('ready', () => {
    console.log('Redis 连接成功！')
});
redisClient.on('error', (err) => {
    console.error('Redis 连接失败：', err);
});
module.exports = redisClient


