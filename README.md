# cloud-rustc

从`crate`入口`rust`文件开始，分析`modules`之间的层级关系，连接关联的多个`rust`文件成为一个`rust`文件。再把被连接在一起的单个`rust`文件发送给`POST - https://play.rust-lang.org/execute`或`POST - https://play.rust-lang.org/compile`云端服务进行编译。最后，显示云端编译后返回的结果（区分标准输出与标准错误输出）。

从而，利用`Mozilla`云端编译器，缓解本地`rustc`编译过慢（这逼着我换电脑呀！），但又急于获悉`cargo test`（甚至`cargo run`）运行结果的尴尬。

## 安装

```shell
npm i -g cloud-rustc
```

## 用法

```shell
cloud-rustc run -e rust-samples/sm4_like/mod.rs
```

### 子命令

|命令|描述|
|--------|-------------|
|run|功能等同于 cargo run|
|build|功能等同于 cargo build|
|test|功能等同于 cargo test|
|wasm|编译生成 WEB 字节码文件|
|asm|编译生成字节码文件|
|mir|编译生成 MIR 文件|
|llvm-ir|编译生成 LLVM-IR 文件|
|help [command]|显示指定子命令的帮助信息|

### 选项

|选项|描述|
|--------|-------------|
|-e, --entry &lt;uri&gt;|rust crate 入口文件|
|-md, --mode [mode]|编译模式：debug \| release (default: "debug")|
|-cl, --channel [channel]|rustc 编译器类型：nightly \| beta \| stable (default: "nightly")|
|-ed, --edition [edition]|rustc 编译器大版本号：2018 \| 2015 (default: "2018")|
|-bt, --back-trace|在错误信息中，显示详细的函数调用栈 (default: false)|
|-o, --output-file [file]|输出编译结果至文件|
|-V, --version|此工具当前版本号|
|-h, --help|显示帮助信息|
