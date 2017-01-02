# Online markdown reader
Markdown 文件在线阅读器。

<!-- toc -->

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


## 说明

### Markdown 文件解析
程序使用 [marked](https://github.com/chjj/marked) 解析文件。

### Markdown 样式
`Markdown` 的显示样式都在 `assets/css/markdown.css` 里，如果需要自定义样式，只需修改这个文件。

### 本地图片
如果需要显示本地图片，需要手动的将图片上传一下（支持批量上传），程序使用 `FileReader` 读取上传的图片，然后将图片的本地路径替换为图片的内容。图片压缩对 `jpg` 文件效果较好，对于 `png` 文件效果较差

### 缓存
上次打开的文件和配置信息都保存在 `localStorage` 里，如果清理了缓存，就可能丢失这些信息。另外浏览器对于 `localStorage` 的容量有限制，所以不要保存太大的文件。

### 扩展
在现有程序的基础上，我们可以很方便的添加扩展功能。基本流程大概就是引入扩展的库文件，在渲染 Markdown 文件时 调用库文件相应的方法。以添加时序图为例：  

* 确定时序图的代码标记
<pre lang="no-highlight"><code>```javascript
var s = "JavaScript syntax highlighting";
alert(s);
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