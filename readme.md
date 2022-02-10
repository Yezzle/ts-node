## Introduction

    This is a TpeScript runner cli tool. You can use this tool to run a '.ts' file directly

## Usage

```bash
git clone https://github.com/Yezzle/ts-node.git

npm install

# now you can use ts-node at any time and anywhere

# there are some preinstalled tools, like rename

# example: rename curDir files in match patern
ts-node rename 登记表(\\d+) $1日记录
```

## tools

- rename

    rename files in current directory.
```
ts-node rename <pattern> <replacement>
```
    `pattern` is a Regex pattern string, and replacement is a Regex replacement string in Javascript, you can use $1, $2, or $3 for matching groups

- more tools are on the way