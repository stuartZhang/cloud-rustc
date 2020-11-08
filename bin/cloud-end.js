const https = require('https');
const debug = require('debug');
const {program} = require('./parseArgs');

const logTrace = debug('cloud-rustc:trace');
const logErr = debug('cloud-rustc:error');

module.exports = rsFile => {
    const json = {
        code: rsFile,
        backtrace: program.backTrace,
        channel: program.channel,
        crateType: program.crateType,
        edition: program.edition,
        mode: program.mode,
        tests: program.tests
    };
    if (program.cloudActionType === 'execute') {
        return httpsPost('/execute', json);
    }
    return httpsPost('/compile', {
        ...json,
        assemblyFlavor: program.assemblyFlavor,
        demangleAssembly: program.demangleAssembly,
        processAssembly: program.processAssembly,
        target: program.target
    });
};
function httpsPost(pathName, reqJson){
    return new Promise((resolve, reject) => {
        const reqBody = JSON.stringify(reqJson);
        const req = https.request({
            hostname: 'play.rust-lang.org',
            port: 443,
            path: pathName,
            method: 'POST',
            headers: {
                'accept': '*/*',
                'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'pragma': 'no-cache',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin'
            }
        }, res => {
            res.setEncoding('utf8');
            let buffer;
            res.on('data', chunk => {
                if (buffer == null) {
                    buffer = chunk;
                } else {
                    buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);
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
        req.on('error', err => {
            logErr('请求失败', err);
            reject(err);
        });
        logTrace(reqBody);
        req.write(reqBody);
        req.end();
    });
}
