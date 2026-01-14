const fs = require("fs")
module.exports = {
	index: (res) => {
		fs.readFile("./src/index.html", "utf-8", (err, data) => {
			if (err) {
				res.end("文件读取失败")
				throw err
			}
			return res.end(data)
		})
	},
	getUser: (res) => {
		res.setHeader("Content-Type", "application/json")
		const data = JSON.stringify({
			code: 0,
			message: "success",
			data: {
				name: "张三",
				age: 18,
			},
		})
		return res.end(data)
	},
	setUser: (res, params) => {
		res.setHeader("Content-Type", "application/json")
		const data = JSON.stringify({
			code: 0,
			message: "success",
			data: { ...params, id: new Date().getTime() },
		})
		return res.end(data)
	},
	processImage: (res, url) => {
		fs.readFile(`./src${url}`, (err, data) => {
			if (err) {
				res.end("文件读取失败")
				throw err
			}
			res.setHeader("Content-Type", "image/png") // 设置响应头，告诉浏览器返回的内容类型是图片
      console.log('data',data)
			return res.end(data)
		})
	},
}
