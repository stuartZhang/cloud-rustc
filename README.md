# rust-cloud-playground

从`crate`入口`rust`文件开始，分析`modules`之间的层级关系，连接关联的多个`rust`文件成为一个`rust`文件。再把被连接在一起的单个`rust`文件发送给`POST - https://play.rust-lang.org/execute`云端接口进行编译。最后，显示后端返回的编译结果。
