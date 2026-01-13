const myAction = require('./action')
const myCommander = function (program){
    program.command('create <project> [other...]')
    .alias('crt') // 别名
    .description('创建项目') // 描述
    .action(myAction)
}


module.exports = myCommander