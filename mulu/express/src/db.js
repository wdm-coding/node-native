const mysql = require('mysql2')

const pool = mysql.createPool({
  host: 'rm-2ze84214zfe5t4ra3no.mysql.rds.aliyuncs.com',
  user: 'wdm_db',
  password: 'Wdm199496',
  database: 'wdm_db'
})

module.exports = pool.promise()