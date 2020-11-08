#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const {program} = require('./parseArgs');
const {linkModules, writeResultFile} = require('./link-rs');
const cloud = require('./cloud-end');
(async () => {
    let rsFilePath = program.entry;
    if (!path.isAbsolute(rsFilePath)) {
        rsFilePath = path.resolve(rsFilePath);
    }
    const rsFile = await linkModules(rsFilePath, null);
    const result = await cloud(rsFile);
    process.stdout.write(`\n==== ${result.success ? chalk.greenBright('成功') : chalk.redBright('失败')} ====\n\n`);
    process.stderr.write(`${chalk.redBright(result.stderr)}\n`);
    process.stdout.write(chalk.greenBright(result.stdout));
    await writeResultFile([
        `${result.success ? '成功' : '失败'}\n\n`,
        result.stderr,
        result.stdout
    ].join(''));
})();
