const url = require("url")
const controller = require("./controller")
module.exports = (req, res) => {
	const { pathname, query } = url.parse(req.url, true)
	if (req.method === "GET") {
		switch (pathname) {
			case "/":
				controller.index(res)
				break
			case "/getUser":
				controller.getUser(res)
				break
			default:
				if (pathname.includes(".png")) {
          console.log(111)
					controller.processImage(res, req.url)
				} else {
					res.end("<h1>404</h1>")
				}
				break
		}
	} else if (req.method === "POST") {
		switch (pathname) {
			case "/setUser":
				let data = ""
				req.on("data", (chunk) => {
					data += chunk
				})
				req.on("end", () => {
					const obj = JSON.parse(data)
					controller.setUser(res, obj)
				})
				break
			default:
				res.end("<h1>404</h1>")
				break
		}
	} else {
		res.end("<h1>404</h1>")
	}
}
