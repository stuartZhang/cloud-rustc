const https = require('https');
const semver = require('semver');
const chalk = require('chalk');
const debug = require('debug');
const pkg = require('../package.json');

const logTrace = debug('cloud-rustc:trace');
const logErr = debug('cloud-rustc:error');
const log1 = debug('cloud-rustc:check-version');

module.exports = () => {
    // Ensure minimum supported node version is used
    log1('nodejs 现场版本号', process.version, '；期望版本号', pkg.engines.node);
    if (!semver.satisfies(process.version, pkg.engines.node)) {
        console.error(chalk.red(`  nodejs 最低版本要求${pkg.engines.node}.x，您需要使用 nvm 升级 nodejs。`));
        return Promise.reject(new Error(`nodejs 最低版本要求${pkg.engines.node}.x，您需要使用 nvm 升级 nodejs。`));
    }
    return httpsGet('https://registry.npmjs.org/cloud-rustc', {timeout: 1500}).then(json => {
        const latestVersion = json['dist-tags'].latest;
        const localVersion = pkg.version;
        log1('cloud-rustc 命令程序 现场版本号', localVersion, '；期望版本号', latestVersion);
        if (semver.lt(localVersion, latestVersion)) {
            console.log(chalk.yellow('  有最新版本的 cloud-rustc 可供使用，请升级之。'));
            console.log();
            console.log(`  最新版本: ${ chalk.green(latestVersion)}`);
            console.log(`  本地版本: ${ chalk.red(localVersion)}`);
            console.log();
            console.log(`  执行命令: ${ chalk.cyan('npm i -g cloud-rustc@latest')}`);
            console.log();
        }
    }, err => {
        logErr('版本请求失败', err);
    });
};
function httpsGet(url, options = {}){
    return new Promise((resolve, reject) => {
        const req = https.get(url, options, res => {
            res.setEncoding('utf8');
            let buffer;
            res.on('data', chunk => {
                if (buffer == null) {
                    buffer = chunk;
                } else if (Buffer.isBuffer(chunk)) {
                    buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);
                } else if (typeof chunk === 'string') {
                    buffer += chunk;
                }
            });
            res.on('end', () => {
                const result = buffer ? buffer.toString('utf8') : '';
                if (res.statusCode === 200) {
                    logTrace(result);
                    resolve(JSON.parse(result));
                } else {
                    reject(new Error(`返回错误响应：${result}`));
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}
