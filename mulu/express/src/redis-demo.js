const redisClient = require('../config/redis'); // 引入 Redis 配置
async function setMap() {
  const num = Math.round(Math.random() * 30 + 1)
  const str = 'abcdef'
  const strtap = Math.round(Math.random() * 6 + 0)
  const data =  await redisClient.zscore('hots', str[strtap]);
  if (data) {
    await redisClient.zincrby('hots', num, str[strtap]); // 否则，增加该值
    console.log('获取',str[strtap]+ '+1');
  }else{ // 如果不存在，则设置该值
    const write = await redisClient.zadd('hots', num, str[strtap]); // 否则，增加该值
    console.log('写入',str[strtap]+write);
  }
  const sort = await redisClient.zrevrange('hots', 0, -1,'withscores'); // 获取排行榜数据
  console.log('排行榜',sort);
  //  获取集合的键和值
  const obj = {};
  for (let i = 0; i < sort.length; i += 2) {
    obj[sort[i]] = sort[i + 1];
    console.log(`obj:`,obj);
  }
}