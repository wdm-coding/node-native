const inquirer = require('inquirer')
const config = require('../../config')
const myDownload = require('./download')
const myInquirer = async function (project,args) {
  // 问答式交互
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '请输入项目名称'
    },
    {
      type: 'list',
      name: 'framwork',
      message: '请选择框架类型',
      choices: config.framworks
    },
    {
      type: 'confirm',
      name: 'sure',
      message: '确定要创建吗?'
    }
  ])
  if(answers){
    if(!answers.sure) return // 如果用户不确认，则退出创建流程
    answers.name = answers.name || project // 如果用户没有输入项目名称，则使用命令行中的参数作为项目名
    if(answers.framwork){ // 如果用户选择了框架，则进行下载操作
      myDownload(config.framworksUrl[answers.framwork],answers.framwork,answers.name)
    }
  }
}

module.exports = myInquirer