// 返回请求失败
function failBack(res,err,status=200) {
  return res.status(status).json({
    code: err.code || 1,
    msg: err.message || '请求失败',
    data: null
  })
}

// 返回请求成功
function successBack(res,data={},msg='请求成功',status=200) {
  return res.status(status).json({
    code: 0,
    msg,
    data
  })
}

module.exports = {
  failBack,
  successBack
}