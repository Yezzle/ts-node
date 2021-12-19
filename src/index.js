#!/usr/bin/env node
const fs = require('fs');
const Module = require('module');
const ts = require('typescript');
const path = require('path');
const repl = require('repl');
const vm = require('vm');
let tsconfigfile = '.tsconfig.json';
const filePath = process.argv[2]
const cwd = process.cwd();

// 设置ts文件的require hook
Module._extensions['.ts'] = function(module, filename){
    
    // 读取ts文件
    const content = fs.readFileSync(filename, 'utf8')
    // 获取ts配置
    const tsOpt = getTsConfig();
    // 编译ts为js
    const { outputText } = ts.transpileModule(content, {compilerOptions: tsOpt})
    // 继续后续编译
    module._compile(outputText, filename)

    /**
     * 如果.ts文件与js语法一样, 该方法可以直接忽略上面编译过程直接返回.js的hooks：
     *   return Module._extensions['.js](module, filename)
     * 如此思路可以允许允许任意后缀文件，只要语法是js语法
     */
}
// 获取.tsconfig.json配置
function getTsConfig(){
    if(fs.existsSync(path.join(cwd, tsconfigfile))){
        return require(path.join(cwd, tsconfigfile));
    }
    return {}
}
// 如果有文件则执行文件, 否则启动交互式命令行
if(filePath){
    const fullPath = path.resolve(cwd, filePath)
    require(fullPath)
} else { 
    const r = repl.start({
        prompt: ':--> ',
        eval: tsEval
    })
    // 可定义环境变量
    Object.defineProperty(r.context, 'who', {
        configurable: false,
        enumerable: true,
        value: 'Hello ts'
    })
    // 编译并执行ts语句
    function tsEval(cmd, context, filename, callback){
        const { outputText } = ts.transpileModule(cmd, {
            compilerOptions: {
                strict: true,
                sourceMap: false,
            }
        })
        // vm模块可以在指定上下文中执行js code
        const result = vm.runInContext(outputText, r.context)
        // 执行回调之后交互式命令行才进入准备输入状态
        callback(null, result)
    }
}
