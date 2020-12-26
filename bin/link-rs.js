const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const debug = require('debug');
const {program} = require('./parseArgs');

const logInfo = debug('cloud-rustc:info');
const padLeft = ' '.repeat(4);

Object.assign(exports, {linkModules, readRsFile, writeResultFile});

async function linkModules(rsFilePath){
    const rsFile = await readRsFile(rsFilePath);
    const pubModPatten = /^\s*#\[\s*path\s*=\s*"([^"]+)"\s*\]\s*$|^(\s*(?:pub\s+)?)mod\s+([^;\n]+)\s*;\s*$/umg;
    const modules = [];
    let fileName, match;
    while (Array.isArray(match = pubModPatten.exec(rsFile))) {
        if (/^\s*#\[\s*path\s*=\s*"([^"]+)"\s*\]\s*$/u.test(match[0])) {
            fileName = match[1].replace(/\.rs\s*$/u, '');
        } else if (/^(\s*(?:pub\s+)?)mod\s+([^;\n]+)\s*;\s*$/u.test(match[0])) {
            let endIndex = match.index + match[0].length;
            if (endIndex < rsFile.length - 1) {
                endIndex += 1;
            }
            modules.push({
                visibility: match[2],
                startIndex: match.index,
                endIndex,
                identifier: match[3],
                fileName: fileName || match[3]
            });
            fileName = null;
        }
    }
    if (modules.length <= 0) {
        return rsFile;
    }
    modules.reverse();
    const rsFileDir1 = path.dirname(rsFilePath);
    const rsFileDir2 = rsFilePath.replace(new RegExp(`\\${path.extname(rsFilePath)}$`, 'u'), '');
    let linkedRsFile = rsFile;
    for (const {visibility, startIndex, endIndex, identifier, fileName} of modules) {
        const str1 = linkedRsFile.substring(0, startIndex);
        const str2 = linkedRsFile.substring(endIndex);
        let isValidRsDir, isValidRsFile, rsDirPath, rsFilePath;
        for (const rsDirPath_ of [path.join(rsFileDir2, fileName), path.join(rsFileDir1, fileName)]) {
            rsDirPath = rsDirPath_;
            rsFilePath = `${rsDirPath}.rs`;
            isValidRsDir = await fs.pathExists(rsDirPath) && (await fs.stat(rsDirPath)).isDirectory();
            isValidRsFile = await fs.pathExists(rsFilePath) && (await fs.stat(rsFilePath)).isFile();
            if (isValidRsDir || isValidRsFile) {
                break;
            }
        }
        let rsFile;
        if (isValidRsFile) {
            logInfo(chalk.blueBright(`内联模块文件：${rsFilePath}`));
            rsFile = await linkModules(rsFilePath);
        } else if (isValidRsDir) {
            rsFilePath = path.join(rsFileDir1, 'mod.rs');
            isValidRsFile = await fs.pathExists(rsFilePath) && (await fs.stat(rsFilePath)).isFile();
            if (isValidRsFile) {
                logInfo(chalk.blueBright(`内联模块目录：${rsFilePath}`));
                rsFile = await linkModules(rsFilePath);
            } else {
                throw new Error(`在【模块目录 - ${rsFileDir1}】内没有 mod.rs 文件`);
            }
        }
        linkedRsFile = `${str1.replace(/(?:^|\n)\s*#\[\s*path\s*=\s*"([^"]+)"\s*\]\s*$/u, '\n')}${[
                `${visibility}mod ${identifier} {`,
                rsFile.split('\n').map(line => `${visibility}${padLeft}${line}`).join('\n'),
                '}'
        ].join('\n')}\n${str2}`;
    }
    return linkedRsFile;
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
