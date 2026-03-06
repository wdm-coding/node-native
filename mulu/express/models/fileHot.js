const redisClient = require('../config/redis');

async function hotInc(){
    const key = 'hot';
    await redisClient.incr(key); // 原子操作，自增1
    console.log('热榜：', await redisClient.get(key));
}
// 9-11 热榜功能