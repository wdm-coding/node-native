// 下载库到当前目录下
const chalk = require('chalk')
const ora = require('ora')
const spinner = ora()
spinner.text = '正在加载中...'
const download = require('download-git-repo')
const myDownload = function(url,type,projectName){
  spinner.start()
  download(`direct:${url}`, projectName, {clone:true}, function (err) {
    spinner.stop()
    if(err){
      spinner.fail(`${type}下载失败!-${err}`)
      console.log(chalk.red('下载失败!'+ err))
      return
    }else{
      spinner.succeed('下载成功!')
      console.log(chalk.green('Done tou run:'))
      console.log(chalk.green(`cd ${projectName} && npm install`))
      console.log(chalk.green(`npm run dev`))
    }
  })
}

module.exports = myDownload
