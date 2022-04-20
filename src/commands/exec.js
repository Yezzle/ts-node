const cp = require('child_process');
const fs = require('fs');
const { logger } = require('../utils');
let cwd = process.cwd();

const spliter = "&"
function exec(...args){
  cwd = process.cwd();
  let cmds = [];
  let temp = '';

  const param = args[0];
  if(!param) return;
  logger.log(param)
  param.split(' ').filter(Boolean).map(arg => {
    if (arg.includes(spliter)) {
      if (arg === spliter || arg === `${spliter}${spliter}`){
        if (temp) {
          temp.trim() && (cmds.push(temp.trim()));
          temp = '';
        }
      } else {
        const [l, r] = arg.split(new RegExp(spliter + '+'))
        l && (temp += ' ' + l);
        if (temp) {
          temp.trim() && (cmds.push(temp.trim()));
          temp = ''
        }
        r && (temp += ' ' + r);
      }
    } else {
      temp += ' ' + arg;
    }
  });
  temp.trim() && (cmds.push(temp.trim())) && (temp = '');
  runScripts(cmds);
}

async function runScripts(cmds) {
  console.log(cmds)
  for(let i = 0; i < cmds.length; i ++) {
    try {
      await execCmd(cmds[i].replace(/[*']/g, '"'));
    } catch (error) {
      logger.err(error);
    }
  }
}
let context = cwd;
async function execCmd(cmd) {
  logger.log('--------------------------- start cmd --->>', cmd);
  if (resolveContext(cmd)) {
    return;
  }
  return cp.execSync(cmd, {
    stdio: 'inherit',
    cwd: context
  });
}

function resolveContext(cmd) {
  const cdCmdMatcher = /^cd\s(.*)$/
  if (cdCmdMatcher.test(cmd)){
    const p = cmd.match(cdCmdMatcher);
    if (p.startsWith('.')) {
      context = path.resolve(context, p);
    } else if (!p.startsWith('/') && !p.includes(':')) {
      context = path.resolve(context, p)
    } else {
      context = p;
    }
    if (!fs.existsSync(context)) {
      throw new Exception('path not exsit: ', p)
    }
    return true;
  }
}

module.exports = exec;
