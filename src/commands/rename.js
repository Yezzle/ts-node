const fs = require('fs');
const path = require('path');
const runRepl = require('../repl.js');

// const stages = ['selectm', 'inputp', 'inputs', 'selectf'];
const cwd = process.cwd();
const cacheDir = path.join(cwd, '.cache');

/**
 * 文件批量重命名
 * ts-node rename RegExpPattern matchToReplaceStr
 *   eg: ts-node rename 成绩单(\\d{4}) 工资流水$1
 * 
 */
module.exports = {
    apply: function(...args){
        const [p, s] = args;
        if(args.length){
            if(p){
                const reg = new RegExp(p);
                const files = fs.readdirSync(cwd)
                if(!fs.existsSync(cacheDir)){
                    fs.mkdirSync(cacheDir)
                }
                files.map(f => {
                    const fpath = path.join(cwd, f);                    
                    const cachePath = path.join(cacheDir, f)
                    if(f.match(reg)){
                        const newfileName = fpath.replace(reg, s)
                        console.log('renamefile:', fpath,'  to:',newfileName)
                        fs.copyFileSync(fpath, cachePath);
                        fs.renameSync(fpath, newfileName);
                    }
                })
            }
        } else {
            const r = runRepl((tsEval, cmd, context, fileName, cb) => {
                cmd = cmd.slice(0, -1)
                let flag = true
                switch(cmd){
                    case 'exit':
                        console.log('command prompt will close!')
                        r.close();
                        flag = false;
                        break;
                    default: console.log(cmd);
                }
                flag && cb();
            })
        }
    },
    help: ``
}