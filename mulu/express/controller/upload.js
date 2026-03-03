const fs = require('fs');
const {promisify} = require('util');
const rename = promisify(fs.rename);
const {failBack} = require('../utils/backBody');
async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        code: 1, 
        message: '请上传文件' 
      });
    }
    console.log('Received file:', req.file);
    const { originalname, filename, path,mimetype,size } = req.file;
    const typeArr = originalname.split('.')
    const name = filename + '.' + typeArr[typeArr.length - 1]
    await rename(path, `./uploads/${name}`)
    // 文件上传成功，返回响应
    res.status(200).json({ 
      code: 0, 
      message: '文件上传成功', 
      data: { filename:name,type:mimetype,size,originalname}
    })
  }catch (error) {
    failBack(res,error,500);
  }   
}

module.exports = {uploadFile};