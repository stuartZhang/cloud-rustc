const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const debug = require('debug');
const {program} = require('./parseArgs');

const logInfo = debug('cloud-rustc:info');
const padLeft = ' '.repeat(4);

Object.assign(exports, {linkModules, readRsFile, writeResultFile});

async function linkModules(rsFilePath, rsFile){
    if (!rsFilePath && !rsFile) {
        throw new Error('rust 源文件不能是空');
    }
    if (rsFilePath && !rsFile) {
        rsFile = await readRsFile(rsFilePath);
    }
    const pubModPatten = /^(\s*(?:pub\s+)?)mod\s+([^;\n]+)\s*;\s*$/umg;
    const modules = [];
    let match;
    while (Array.isArray(match = pubModPatten.exec(rsFile))) {
        let endIndex = match.index + match[0].length;
        if (endIndex < rsFile.length - 1) {
            endIndex += 1;
        }
        modules.push({
            prefix: match[1],
            startIndex: match.index,
            endIndex,
            name: match[2]
        });
    }
    if (modules.length <= 0) {
        return rsFile;
    }
    modules.reverse();
    const rsFileDir = path.dirname(rsFilePath);
    let linkedRsFile = rsFile;
    for (const {prefix, startIndex, endIndex, name} of modules) {
        const str1 = linkedRsFile.substring(0, startIndex);
        const str2 = linkedRsFile.substring(endIndex);
        const rsFilePath = path.join(rsFileDir, `${name}.rs`);
        logInfo(chalk.blueBright(`内联模块文件：${rsFilePath}`));
        const rsFile = await readRsFile(rsFilePath);
        linkedRsFile = `${str1}${[
            `${prefix}mod ${name} {`,
            rsFile.split('\n').map(line => `${prefix}${padLeft}${line}`).join('\n'),
            '}'
        ].join('\n')}\n${str2}`;
    }
    return linkModules(rsFilePath, linkedRsFile);
}
async function readRsFile(rsFilePath){
    if (!await fs.pathExists(rsFilePath)) {
        throw new Error(`不存在的文件：${rsFilePath}`);
    }
    const entryStats = await fs.stat(rsFilePath);
    if (!entryStats.isFile()) {
        throw new Error(`${rsFilePath}不是一个文件`);
    }
    const rsFile = await fs.readFile(rsFilePath, {encoding: 'utf-8'});
    return rsFile;
}
async function writeResultFile(content){
    let {outputFile} = program;
    if (typeof outputFile === 'string' && outputFile !== '') {
        if (!path.isAbsolute(outputFile)) {
            outputFile = path.resolve(outputFile);
        }
        await fs.writeFile(outputFile, content);
    }
}
