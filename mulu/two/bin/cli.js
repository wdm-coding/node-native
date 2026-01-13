#! /usr/bin/env node

// 命令行工具
const {program} = require('commander')

// 设置命令行参数
const myHelp = require('../lib/core/help')
myHelp(program)

// 自定义命令
const myCommander = require('../lib/core/commander')
myCommander(program)

// 解析命令行参数
program.parse(process.argv)

