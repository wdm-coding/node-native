console.log('js初始化')
// 读取文件内容
const fs = require('fs')

// 读取文件内容
fs.readFile('./src/file.js', 'utf8', (err, data) => {
  if (err) throw err;
  console.log('读取',data);
})
// 写入文件内容
fs.writeFile('./src/file.js', "const arr2 = ['a','b']", (err) => {
  if (err) throw err;
  console.log('文件已被保存');
})
// 追加文件内容
fs.appendFile('./src/file.js', "const arr3 = ['a','b']", (err) => {
  if (err) throw err;
  console.log('文件已被追加');
})