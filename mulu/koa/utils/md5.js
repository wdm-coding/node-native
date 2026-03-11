const crypto = require('crypto')
// 加密函数
function md5(str) {
  return crypto.createHash('md5')
  .update('by' + str)
  .digest('hex')
}

module.exports = md5
