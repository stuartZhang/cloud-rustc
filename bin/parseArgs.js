const program = require('commander');
const pkg = require('../package.json');

const compileModes = ['debug', 'release'];
const channels = ['nightly', 'beta', 'stable'];
const versions = ['2018', '2015'];

Object.assign(exports, {program, compileModes, channels, versions});
program.requiredOption('-e, --entry <uri>', 'rust crate 入口文件');
program.option('-md, --mode [mode]', `编译模式：${compileModes.join(' | ')}`, value => {
    if (!~compileModes.indexOf(value)) {
        throw new Error(`不支持的编译模式：${value}`);
    }
    return value;
}, compileModes[0]);
program.option('-cl, --channel [channel]', `rustc 编译器类型：${channels.join(' | ')}`, value => {
    if (!~channels.indexOf(value)) {
        throw new Error(`不支持的编译器类型：${value}`);
    }
    return value;
}, channels[0]);
program.option('-ed, --edition [edition]', `rustc 编译器大版本号：${versions.join(' | ')}`, value => {
    if (!~versions.indexOf(value)) {
        throw new Error(`不支持的编译器大版本号：${value}`);
    }
    return value;
}, versions[0]);
program.option('-bt, --back-trace', '在错误信息中，显示详细的函数调用栈', false);
program.option('-o, --output-file [file]', '输出编译结果至文件');
program.command('run').description('功能等同于 cargo run').action(() => {
    program.crateType = 'bin';
    program.tests = false;
    program.cloudActionType = 'execute';
});
program.command('build').description('功能等同于 cargo build').action(() => {
    program.crateType = 'lib';
    program.tests = false;
    program.cloudActionType = 'execute';
});
program.command('test').description('功能等同于 cargo test').action(() => {
    program.crateType = 'lib';
    program.tests = true;
    program.cloudActionType = 'execute';
});
program.command('wasm').description('编译生成 WEB 字节码文件').action(() => {
    program.crateType = 'bin';
    program.tests = false;
    program.cloudActionType = 'execute';
    program.assemblyFlavor = 'att';
    program.demangleAssembly = 'demangle';
    program.processAssembly = 'filter';
    program.target = 'wasm';
});
program.command('asm').description('编译生成字节码文件').action(() => {
    program.crateType = 'bin';
    program.tests = false;
    program.cloudActionType = 'execute';
    program.assemblyFlavor = 'att';
    program.demangleAssembly = 'demangle';
    program.processAssembly = 'filter';
    program.target = 'asm';
});
program.command('mir').description('编译生成 MIR 文件').action(() => {
    program.crateType = 'bin';
    program.tests = false;
    program.cloudActionType = 'execute';
    program.assemblyFlavor = 'att';
    program.demangleAssembly = 'demangle';
    program.processAssembly = 'filter';
    program.target = 'mir';
});
program.command('llvm-ir').description('编译生成 LLVM-IR 文件').action(() => {
    program.crateType = 'bin';
    program.tests = false;
    program.cloudActionType = 'execute';
    program.assemblyFlavor = 'att';
    program.demangleAssembly = 'demangle';
    program.processAssembly = 'filter';
    program.target = 'mllvm-irr';
});
program.version(pkg.version).description(pkg.description).parse(process.argv).usage('cloud-rustc run -e ***.rs');
