## node（npm安装/babel使用）

- 安装完node会 自带一个npm包管理器

### npm init 
> 只初始化一次生成package.json 文件 以后不需要再初始化
- 在项目目录下（注意当前项目目录名不能为中文）（只是在第一次的时候生成一个package.json）npm init -y 会生成一个package.json文件

### npm下载安装 
```
npm install 包名 --save-dev
```

## 如安装jquery包

### Mac

> Mac 使用npm的时候每次都要在前面加上sudo

```
 sudo npm install jquery --save-dev
```

### windows
```
 npm install jquery --save-dev
```

### 下载完后 会出来一个 node_modules 文件夹（里面是我用npm下载下来的js）

## babel 使用

> 我们需要 一个 es6转换器 babel  把es6语法转化成es5 
> babel是一个es6编译工具
### 在当前目下 打开命令窗口输入一下命令


## babel 安装
- 如果是在windows命令窗口(cmd)中使用babel需要全局安装 命令如下
```
npm install babel-cli -g
```

### 安装多个包

```
npm install babel-cli babel-preset-es2015 --save-dev

```
### 一个一个安装

```
npm install babel-cli --save-dev

npm install babel-preset-es2015 --save-dev

```

## babel 使用

### 当前目录下 新建一个 .babelrc 

``` 
.babelrc 内容

{
  "presets": ["es2015"]
}

```


编译命令 打开当前目录 命令窗口

```
babel a.js -o b.js
```

## 实时监听编译

### 编译单个文件

```
babel a.js -wo b.js
```

###　指定src目录的js 实时编译到 build目录下

```
babel src -wd build
```
