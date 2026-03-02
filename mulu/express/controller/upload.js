async function uploadFile(req, res) {
  console.log('Received file:', req.file);
  try {
    if (!req.file) {
      return res.status(400).json({ 
        code: 1, 
        message: '请上传文件' 
      });
    }
    // 文件上传成功，返回响应
    res.status(200).json({ 
      code: 0, 
      message: '文件上传成功', 
      data: req.file
    })
  }catch (error) {
      res.status(500).json({ 
        code: 1, 
        message: '文件上传失败', 
        error: error.message 
      });
    }   
}

module.exports = {uploadFile};