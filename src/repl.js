const repl = require('repl');
const vm = require('vm')
const ts = require('typescript');

const tsContext = vm.createContext();
// 可定义环境变量
Object.defineProperty(tsContext, 'who', {
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
    const result = vm.runInContext(outputText, tsContext)
    // 执行回调之后交互式命令行才进入准备输入状态
    callback(null, result)
}

function runRepl(eval = (_, cmd, context, filename, callback)=> tsEval(cmd, context, filename, callback)) {
    const r = repl.start({
        prompt: ':--> ',
        eval:(cmd, context, filename, callback) => {
            eval(tsEval, cmd, context, filename, callback)
        }
    })
    
    return r;
}

module.exports = runRepl