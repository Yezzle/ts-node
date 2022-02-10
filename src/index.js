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

function isCommand(filepath){
    const commands = fs.readdirSync(path.resolve(__dirname, 'commands'));
    const inputCommand = filepath + '.js'
    return commands.includes(inputCommand);
}

// 如果有文件则执行文件, 否则启动交互式命令行
if(filePath){
    const fullPath = path.resolve(cwd, filePath)
    if(isCommand(filePath)){
        runmodule(path.resolve(__dirname, 'commands',  filePath + '.js'), process.argv.slice(3))
    } else {
        runmodule(fullPath, process.argv.slice(3))
    }
} else { 
    require('./repl.js')()
}

function runmodule(modulePath, args){
    if(fs.existsSync(modulePath)){
        const exp = require(modulePath)
        if(exp && Object.prototype.toString.call(exp) === '[object Object]'){
            if(exp.apply && Object.prototype.toString.call(exp.apply) === '[object Function]'){
                exp.apply.apply(null, args)
            }
        } else if(Object.prototype.toString.call(exp) === '[object Function]'){
            exp.apply(null, args)
        }
    }
}
