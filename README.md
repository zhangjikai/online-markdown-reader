# Online markdown reader
Markdown 在线阅读器。

<!-- toc -->

- [功能](#%E5%8A%9F%E8%83%BD)
- [示例](#%E7%A4%BA%E4%BE%8B)
- [扩展语法](#%E6%89%A9%E5%B1%95%E8%AF%AD%E6%B3%95)
  * [Todo列表](#todo%E5%88%97%E8%A1%A8)
  * [Mathjax](#mathjax)
  * [时序图](#%E6%97%B6%E5%BA%8F%E5%9B%BE)
- [其他说明](#%E5%85%B6%E4%BB%96%E8%AF%B4%E6%98%8E)
  * [Markdown 文件解析](#markdown-%E6%96%87%E4%BB%B6%E8%A7%A3%E6%9E%90)
  * [Markdown 样式](#markdown-%E6%A0%B7%E5%BC%8F)
  * [本地图片](#%E6%9C%AC%E5%9C%B0%E5%9B%BE%E7%89%87)
  * [目录](#%E7%9B%AE%E5%BD%95)
  * [缓存](#%E7%BC%93%E5%AD%98)

<!-- tocstop -->

## 功能

+ `Prism.js` / `Highlight.js` 代码高亮
+ 自动生成目录
+ 本地图片显示
+ 导出 Html （包含样式）
+ 扩展功能
    - Toto 列表
    - [MathJax](https://github.com/mathjax/MathJax) 
    - [时序图 (Js sequence diagrams)](https://github.com/bramp/js-sequence-diagrams)
    - [Emoji (Emojify.js)](https://github.com/Ranks/emojify.js)

## 示例
[示例文件](demo/sample.md)    [示例预览](http://zhangjikai.com/markdown/sample.html)
## 扩展语法
### Todo列表
```
- [x] 完成
- [ ] 未完成
- [ ] 未完成
```

### Mathjax
支持原生的 Mathjax 语法。关于Mathjax 语法，请参考[MathJax basic tutorial and quick reference](http://meta.math.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference/5044)

### 时序图
在Markdown 文档中添加下面的代码块，会将代码块中的代码解析为时序图

<pre lang="no-highlight"><code>```seq
时序图代码
```
</code></pre>

### Emoji
Emoji表情参见[EMOJI CHEAT SHEET](http://www.webpagefx.com/tools/emoji-cheat-sheet/)

### 自定义扩展
在现有程序的基础上，我们可以很方便的添加扩展功能。基本流程大概就是引入扩展的库文件，在渲染 Markdown 文件时 调用库文件相应的方法。以添加时序图为例：  

* 确定时序图的代码标记

<pre lang="no-highlight"><code>```seq
时序图代码
```
</code></pre>

* 修改 `marked` 中对于代码块的解析函数，添加对于时序图标记的支持
```js
var renderer = new marked.Renderer();
var originalCodeFun = renderer.code;
renderer.code = function (code, language) {
    if (language == "seq") {
        return "<div class='diagram' id='diagram'>" + code + "</div>"
    } else {
        return originalCodeFun.call(this, code, language);
    }
};
marked.setOptions({
    renderer: renderer
});
```
* 引入 `js-sequence-diagrams` 相关文件
```js
<link href="{{ bower directory }}/js-sequence-diagrams/dist/sequence-diagram-min.css" rel="stylesheet" />
<script src="{{ bower directory }}/bower-webfontloader/webfont.js" />
<script src="{{ bower directory }}/snap.svg/dist/snap.svg-min.js" />
<script src="{{ bower directory }}/underscore/underscore-min.js" />
<script src="{{ bower directory }}/js-sequence-diagrams/dist/sequence-diagram-min.js" />
```
* 渲染 Markdown 文件时，调用相关函数
```js
$(".diagram").sequenceDiagram({theme: 'simple'});
```

如果不需要某个扩展功能，可以停用该功能，以加快文件渲染的速度。

## 其他说明

### Markdown 文件解析
程序使用 [marked](https://github.com/chjj/marked) 解析文件。

### Markdown 样式
`Markdown` 的显示样式都在 `assets/css/markdown.css` 里，如果需要自定义样式，只需修改这个文件。

### 本地图片
如果需要显示本地图片，需要手动的将图片上传一下（支持批量上传），程序使用 `FileReader` 读取上传的图片，然后将图片的本地路径替换为图片的内容。图片压缩对 `jpg` 文件效果较好，对于 `png` 文件效果较差。

### 目录
在需要生成目录的地方加上下面的代码
```
<!-- toc -->
```
如果不加会自动在开头生成。

### 缓存
上次打开的文件和配置信息都保存在 `localStorage` 里，如果清理了缓存，就可能丢失这些信息。另外浏览器对于 `localStorage` 的容量有限制，所以不要保存太大的文件。
