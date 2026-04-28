const multer = require("@koa/multer") // 引入 multer
const uploadMidd = multer({
	dest: "uploads/", // 设置上传文件的存储目录
})
const fs = require("fs")
const { promisify } = require("util")
const rename = promisify(fs.rename)
const { failBack,successBack } = require("../utils/backBody")
async function uploadFile(ctx) {
	try {
    const file = ctx.request.file
		if (!file) {
      failBack(ctx, { message: "请上传文件" })
			return
		}
		console.log("Received file:", file)
		const { originalname, filename, path, mimetype, size } = file
		const typeArr = originalname.split(".")
		const name = filename + "." + typeArr[typeArr.length - 1]
		await rename(path, `./uploads/${name}`)
		// 文件上传成功，返回响应
    successBack(ctx, { filename: name, type: mimetype, size, originalname })
	} catch (error) {
		failBack(ctx, error)
	}
}

module.exports = { uploadFile, uploadMidd }
