module.exports = (res,err,status=200) => {
  return res.status(status).json({
    code: err.code || 1,
    msg: err.message || '请求失败',
    data: null
  })
}