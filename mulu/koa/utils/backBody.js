// 返回请求失败
function failBack(ctx,err,option={code:1,status: 500}) {
  ctx.status = option.status;
  ctx.body = {
    code: option.code,
    msg: err.message || '请求失败',
    data: null
  }
}

// 返回请求成功
function successBack(ctx,data = null,msg = '请求成功',status=200) {
  ctx.status = status;
  ctx.body = {
    code: 0,
    msg: msg,
    data: data
  }
}

module.exports = {
  failBack,
  successBack
}