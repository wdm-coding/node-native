const {validationResult} = require('express-validator');
module.exports = validator => {
  return async (req, res, next) => {
    await Promise.all(validator.map(validation => validation.run(req)))
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(200).json({
        code:1,
        msg: errors.array()[0].msg,
        data: null
      })
    }
    next()
  }
}