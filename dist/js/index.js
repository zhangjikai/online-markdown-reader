/**
 * Created by ZhangJikai on 2016/12/25.
 */

(function () {
    var fileSelect = document.getElementById('select-file');
    var imgSelect = document.getElementById('img-select');
    var cacheImages = {};
    var targetFile;
    var mdName = "";
    var mdContent = "";
    var maxSize = 1024 * 1024 * 4;

    var echartData = [];
    var echartIndex = 0;
    var echartThemeText = "darki infographic macarons roma shine vintage";

    var toc = [];
    var tocDumpIndex = 0;
    var tocStr = "";
    var tocStartIndex = 0;
    var tocTagPos = -1;
    var hasTocTag = false;
    var minLevel = 5;

    var dsConfig = {
        "key": "test",
        "title": "test",
        "url": "test.html",
        "short_name": "zhangjkblog"
    };
    var hasDsConfig = false;


    var Constants = {
        highlight: "highlight",
        prism: "prism",
        mdName: "mdName",
        mdContent: "mdContent",
        tocTag: "<!-- toc -->",
        setting: "setting",
        DHShort: "duoshuoShort"

    };

    var Setting = {
        compressImg: true,
        genToc: true,
        tocLevel: 5,
        highlight: Constants.prism,
        cache: true,
        mathjax: true,
        sd: true,
        emoji: true,
        backtop: true,
        duoshuo: true,
        echarts: true,
        format: true,
        fancybox: true
    };

    var exportSetting = {
        mathjax: false,
        echarts: false
    };

    var renderer = new marked.Renderer();

    /* Todo列表 */
    renderer.listitem = function (text) {
        if (/^\s*\[[x ]\]\s*/.test(text)) {
            text = text
                .replace(/^\s*\[ \]\s*/, '<input type="checkbox" class="task-list-item-checkbox" disabled> ')
                .replace(/^\s*\[x\]\s*/, '<input type="checkbox" class="task-list-item-checkbox" disabled checked> ');
            return '<li style="list-style: none">' + text + '</li>';
        } else {
            return '<li>' + text + '</li>';
        }
    };

    renderer.heading = function (text, level) {
        var slug = text.toLowerCase().replace(/[\s]+/g, '-');
        if (tocStr.indexOf(slug) != -1) {
            slug += "-" + tocDumpIndex;
            tocDumpIndex++;
        }

        tocStr += slug;
        toc.push({
            level: level,
            slug: slug,
            title: text
        });

        return "<h" + level + " id=\"" + slug + "\"><a href=\"#" + slug + "\" class=\"anchor\">" + '' +
            '<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>' +
            '' + "</a>" + text + "</h" + level + ">";
    };

    //var originalCodeFun = renderer.code;

    // 处理图片，添加jquery fancybox 支持
    renderer.image = function (href, title, text) {
        //console.log(this.options.xhtml);
        var out = '<div class="fancybox-image" data-fancybox-group="fancybox-gallery" href="' + href + '"><img src="' + href + '" alt="' + text + '"';
        //var out = '<a class="fancybox-image" rel="fancybox-gallery"><img src="' + href + '" alt="' + text + '"';
        if (title) {
            out += ' title="' + title + '"';
        }
        out += "/></div>"
        //out += this.options.xhtml ? '/>' : '>';
        return out;
    };

    var originalCodeFun = function (code, lang) {


        if (Setting.highlight == Constants.highlight) {
            return "<pre><code class='" + lang +
                "'>" + code + "</code></pre>";
        }

        /*if (Setting.highlight == Constants.syntaxhigh) {
         return "<pre  class=' brush: " + lang +
         "; toolbar: false;'>" + code + "</pre>";
         }*/

        return "<pre><code class='language-" + lang +
            "'>" + code + "</code></pre>";

    };
    renderer.code = function (code, language) {
        switch (language) {
            case "seq":
                if (Setting.sd) {
                    return "<div class='diagram' id='diagram'>" + code + "</div>"
                }
                return originalCodeFun.call(this, code, language);
            case "mathjax":
                if (Setting.mathjax || exportSetting.mathjax) {
                    return "<p>" + code + "</p>\n";
                }
                return originalCodeFun.call(this, code, language);
            case "duoshuo":
                if (Setting.duoshuo) {
                    loadDuoshuoConfig(code);
                }
                return "";
            case "echarts":
                if (Setting.echarts || exportSetting.echarts) {
                    return loadEcharts(code);
                }
                return originalCodeFun.call(this, code, language);
            default :
                return originalCodeFun.call(this, code, language);
        }
    };


    function loadDuoshuoConfig(text) {
        try {
            var config = JSON.parse(text);
            for (var key in config) {
                var newValue = config[key];
                if (newValue === undefined) {
                    console.warn('\'' + key + '\' parameter is undefined.');
                    continue;
                }
                if (key in dsConfig) {
                    dsConfig[key] = newValue;
                }
            }
            localStorage.setItem(Constants.DHShort, dsConfig.short_name);
        } catch (e) {
            sweetAlert("出错了", "解析 多说 配置出现错误，请检查语法", "error");
            console.log(e);
        }
    }

    function loadEcharts(text) {
        var width = "100%";
        var height = "400px";

        try {
            var options = eval("(" + text + ")");

            if (options.hasOwnProperty("width")) {
                width = options["width"];
            }

            if (options.hasOwnProperty("height")) {
                height = options["height"];
            }

            echartIndex++;
            echartData.push({
                id: echartIndex,
                option: options,
                previousOption: text
            });

            return '<div id="echarts-' + echartIndex + '" style="width: ' + width + ';height:' + height + ';"></div>'
        } catch (e) {

            sweetAlert("出错了", "解析 ECharts 配置出现错误，请检查语法", "error");
            console.log(e);
            return "";
        }
    }

    marked.setOptions({
        renderer: renderer
    });

    function refreshAuto() {
        setInterval(load, 3000);
    }


    function load() {
        if (targetFile == null) {
            return;
        }
        var reader = new FileReader();
        reader.readAsText(targetFile);
        mdName = delExtension(targetFile.name);

        reader.onload = function (e) {
            document.getElementById("content").innerHTML = marked(e.target.result);
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, "content"]);
        }
    }

    function dragMdEnter(e) {
        e.stopPropagation();
        e.preventDefault();
        $("#upload").css("border-color", "#3bafda");
    }

    function dragMdLeave(e) {
        e.stopPropagation();
        e.preventDefault();
        $("#upload").css("border-color", "#ddd");
    }

    function dropMdFile(e) {
        e.stopPropagation();
        e.preventDefault();
        $("#upload").css("border-color", "#ddd");

        if (e.dataTransfer.files == null || e.dataTransfer.files[0] == null) {
            return;
        }
        processMdFile(e.dataTransfer.files[0]);
    }


    function selectMdFile(e) {
        e.stopPropagation();
        e.preventDefault();
        if (this.files == null || this.files[0] == null) {
            return;
        }
        processMdFile(this.files[0]);
    }

    function processMdFile(mdFile) {
        targetFile = mdFile;
        if (!checkMdExt(targetFile.name)) {
            var modal = $('[data-remodal-id=md-tip]').remodal();
            modal.open();
            return;
        }
        $("#loader").css("display", "block");
        var reader = new FileReader();
        reader.readAsText(targetFile);
        mdName = delExtension(targetFile.name);

        reader.onload = function (e) {
            mdContent = e.target.result;

            if (Setting.cache) {
                saveMdFile(mdName, mdContent);
            } else {
                removeCacheFile();
            }

            processMdContent(mdContent);
        };

    }


    function resetBeforeProcess() {
        toc.length = 0;
        tocStr = "";
        echartIndex = 0;
        echartData.length = 0;
    }

    function processMdContent(content) {

        try {
            resetBeforeProcess();
            calTocStart(content);
            setDsConfig(mdName);
            $("#content").html(marked(content));

            replaceImage();

            if (Setting.genToc) {
                genToc();
            }

            if (Setting.highlight == Constants.highlight) {
                $('pre code').each(function (i, block) {
                    hljs.highlightBlock(block);
                });
            } else {
                $("pre").addClass("line-numbers");
                Prism.highlightAll();
            }

            if (Setting.mathjax) {

                if (MathJax.Extension["TeX/AMSmath"] != null) {
                    MathJax.Extension["TeX/AMSmath"].startNumber = 0;
                    MathJax.Extension["TeX/AMSmath"].labels = {};
                }

                MathJax.Hub.Queue(["Typeset", MathJax.Hub, "content"]);
            }

            if (Setting.emoji) {
                emojify.run(document.getElementById('content'))
            }

            if (Setting.sd) {
                $(".diagram").sequenceDiagram({theme: 'simple'});
            }

            if (Setting.echarts) {
                var chart;
                echartData.forEach(function (data) {
                    if (data.option.theme) {
                        chart = echarts.init(document.getElementById('echarts-' + data.id), data.option.theme);
                    } else {
                        chart = echarts.init(document.getElementById('echarts-' + data.id));
                    }
                    chart.setOption(data.option);
                });
            }

            if (Setting.fancybox) {
                $(".fancybox-image").fancybox();
            }
        } catch (e) {
            sweetAlert("出错了", "处理文件出现错误，请检查语法", "error");
        }


        $("#loader").css("display", "none");

        collapseUpload();
    }

    function refresh() {
        if (targetFile == null) {
            processMdContent(mdContent);
        } else {
            processMdFile(targetFile);
        }
    }

    function clear() {
        localStorage.removeItem(Constants.mdName);
        localStorage.removeItem(Constants.mdContent);
        window.location.reload();
    }

    function saveMdFile(name, content) {

        if (content.length > maxSize) {
            var sizeTip = $('[data-remodal-id=size-tip]').remodal();
            sizeTip.open();
            removeCacheFile();
            return;
        }
        localStorage.setItem(Constants.mdName, name);
        localStorage.setItem(Constants.mdContent, content);
    }

    function setDsConfig(name) {
        dsConfig.key = name;
        dsConfig.title = name;
        dsConfig.url = name + ".html";
    }

    function removeCacheFile() {
        localStorage.removeItem(Constants.mdName);
        localStorage.removeItem(Constants.mdContent);
    }

    function dragImgEnter(e) {
        e.stopPropagation();
        e.preventDefault();
        $("#img-upload").css("border-color", "#3bafda");
    }

    function dragImgLeave(e) {
        e.stopPropagation();
        e.preventDefault();
        $("#img-upload").css("border-color", "#ddd");
    }

    function dropImgFile(e) {

        e.stopPropagation();
        e.preventDefault();
        var imgModal = $('[data-remodal-id=modal]').remodal();
        imgModal.close();
        $("#img-upload").css("border-color", "#ddd");
        processImages(e.dataTransfer.files)

    }

    function selectImages(e) {

        e.stopPropagation();
        e.preventDefault();
        var imgModal = $('[data-remodal-id=modal]').remodal();
        imgModal.close();
        $("#img-upload").css("border-color", "#ddd");
        processImages(this.files)

    }

    function processImages(imgFiles) {

        var length = imgFiles.length;
        var i, index = 0;

        for (i = 0; i < imgFiles.length; i++) {
            if (!checkImgExt(imgFiles[i].name)) {
                var imgTip = $('[data-remodal-id=img-tip]').remodal();
                imgTip.open();
                return;
            }
        }

        $("#loader").css("display", "block");
        for (i = 0; i < imgFiles.length; i++) {
            var file = imgFiles[i];
            var reader = new FileReader();
            reader.readAsDataURL(file);
            (function (reader, file) {
                reader.onload = function (e) {
                    if (Setting.compressImg) {
                        var image = new Image();
                        image.src = e.target.result;
                        var ext = getImgExtension(file.name);
                        var format = "image/png";
                        if (ext.toLowerCase() == "jpg" || ext.toLowerCase() == "jpeg") {
                            format = "image/jpeg";
                        }
                        cacheImages[file.name] = compressImage(image, format);
                    } else {
                        cacheImages[file.name] = e.target.result;
                    }
                    index++;
                    if (index == length) {
                        replaceImage();
                    }
                }
            })(reader, file);
        }
    }

    function replaceImage() {
        var images = $("img");

        var i;
        for (i = 0; i < images.length; i++) {
            var imgSrc;
            if ($(images[i]).attr("pname") == null) {
                imgSrc = images[i].src;
                $(images[i]).attr("pName", imgSrc);

            } else {
                imgSrc = $(images[i]).attr("pname");
            }

            var imgName = getImgName(imgSrc);
            if (cacheImages.hasOwnProperty(imgName)) {
                images[i].src = cacheImages[imgName];
                $(images[i]).parent().attr("href", images[i].src);
            }
        }
        $("#loader").css("display", "none");
    }

    function compressImage(img, format) {

        var max_width = 862;
        var canvas = document.createElement('canvas');

        var width = img.width;
        var height = img.height;
        if (format == null || format == "") {
            format = "image/png";
        }

        if (width > max_width) {
            height = Math.round(height *= max_width / width);
            width = max_width;
        }

        // resize the canvas and draw the image data into it
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL(format);
    }


    function calTocStart(mdContent) {
        var heading = /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/igm;
        var match;
        tocTagPos = mdContent.indexOf(Constants.tocTag);
        tocStartIndex = 0;
        if (tocTagPos == -1) {
            hasTocTag = false;
            return;
        }

        hasTocTag = true;
        while ((match = heading.exec(mdContent)) != null) {
            //console.log(match.index);
            if (match.index > tocTagPos) {
                break;
            }
            tocStartIndex++;
        }
    }

    function genToc() {

        var lastLevel = 0;

        var tocLevel = Setting.tocLevel;
        var i, j, singleToc;
        var tocHtml = "";
        var ulCount = 0;
        minLevel = 5;

        for (i = tocStartIndex; i < toc.length; i++) {
            singleToc = toc[i];
            if (singleToc.level < minLevel) {
                minLevel = singleToc.level;
            }
        }
        lastLevel = minLevel - 1;

        for (i = tocStartIndex; i < toc.length; i++) {
            singleToc = toc[i];

            if (singleToc.level > tocLevel) {
                continue;
            }
            if (lastLevel > singleToc.level) {
                for (j = lastLevel - singleToc.level; j >= 0; j--) {
                    tocHtml += "</ul>";
                    ulCount--;
                }
                tocHtml += "<ul>"
                ulCount++;
            }

            if (lastLevel < singleToc.level) {
                for (j = singleToc.level - lastLevel; j > 0; j--) {
                    tocHtml += "<ul>";
                    ulCount++;
                }

            }
            tocHtml += "<li><a href='#" + singleToc.slug + "'>" + singleToc.title + "</a></li>"
            lastLevel = singleToc.level;
        }

        for (i = 0; i < ulCount; i++) {
            tocHtml += "</ul>"
        }

        if (hasTocTag) {
            var content = $("#content").html();
            content = content.replace(Constants.tocTag, tocHtml);
            $("#content").html(content);
        } else {
            $("#content").prepend(tocHtml);
        }
    }

    function loadCacheFile() {
        var file = localStorage.getItem(Constants.mdContent);
        if (file == null || file == "") {
            $("#loader").css("display", "none");
            return;
        }

        mdName = localStorage.getItem(Constants.mdName);
        //console.log(mdName);
        mdContent = file;
        processMdContent(mdContent);
        $("#loader").css("display", "none");
    }

    function loadSetting() {
        var tmpSetting = localStorage.getItem(Constants.setting);
        if (tmpSetting == null) {
            return;
        }
        tmpSetting = JSON.parse(tmpSetting);
        for (var key in tmpSetting) {
            var newValue = tmpSetting[key];
            if (newValue === undefined) {
                console.warn('\'' + key + '\' parameter is undefined.');
                continue;
            }
            if (key in Setting) {
                Setting[key] = newValue;
            }
        }

        var sname = localStorage.getItem(Constants.DHShort);
        if (sname != null) {
            dsConfig.short_name = sname;
        }
    }

    function saveSetting() {
        processMdContent(mdContent);
        localStorage.setItem(Constants.setting, JSON.stringify(Setting));
    }

    function addSetting() {

        $("[name='set']").each(function (index, ele) {

            $(ele).prop("checked", Setting[$(ele).attr("ref")]);
            $(ele).change(function (e) {
                //console.log($(ele).is(":checked"))
                Setting[$(ele).attr("ref")] = $(ele).is(":checked");
                saveSetting();
            })
        });

        $("#s_toc").prop("checked", Setting['genToc']);
        $("#toc-level").val(Setting['tocLevel']);

        $("#s_toc").change(function (e) {
            Setting["genToc"] = $("#s_toc").is(":checked");

            if (Setting["genToc"]) {
                $("#toc-level").prop("disabled", false);
            } else {
                $("#toc-level").prop("disabled", true);
            }
            saveSetting();
        });

        $("#toc-level").change(function (e) {
            var val = parseInt($("#toc-level").val());
            if (val < 1) {
                val = 1;
            }
            if (val > 5) {
                val = 5;
            }
            Setting["tocLevel"] = val;
            $("#toc-level").val(val);
            saveSetting();
        });

        if (Setting["highlight"] == Constants.highlight) {
            $("#s_highlight").prop("checked", true);
        } else {
            $("#s_prism").prop("checked", true);
        }

        $("[name='high']").each(function (index, ele) {
            $(ele).change(function (e) {
                var text = $(ele).prop("id");
                if (text == "s_highlight") {
                    Setting["highlight"] = Constants.highlight;
                } else {
                    Setting["highlight"] = Constants.prism;
                }
                saveSetting();
            })
        })

    }

    function exportHtml() {

        var htmlContent = "";


        var styleContent = "";
        var jsContent = "";

        if (Setting.highlight == Constants.highlight) {
            styleContent += '<link href="http://cdn.bootcss.com/highlight.js/9.8.0/styles/atom-one-light.min.css" rel="stylesheet">';
        } else {
            styleContent += '<link href="http://cdn.bootcss.com/prism/9000.0.1/themes/prism.min.css" rel="stylesheet">'
            styleContent += '<link href="http://cdn.bootcss.com/prism/9000.0.1/plugins/line-numbers/prism-line-numbers.min.css" rel="stylesheet">';
        }

        if (Setting.emoji) {
            styleContent += '<link href="http://cdn.bootcss.com/emojify.js/1.1.0/css/basic/emojify.min.css" rel="stylesheet">';
        }

        var preMajax = Setting.mathjax;
        var preEcharts = Setting.echarts;

        if (preMajax) {
            Setting.mathjax = false;
            exportSetting.mathjax = true;
        }

        if (preEcharts) {
            Setting.echarts = false;
            exportSetting.echarts = true;
        }

        processMdContent(mdContent);
        htmlContent = $("#content").html();

        Setting.mathjax = preMajax;
        Setting.echarts = preEcharts;
        exportSetting.mathjax = false;
        exportSetting.echarts = false;

        processMdContent(mdContent);
        var jquery = Setting.fancybox || Setting.backtop;
        if (jquery) {
            jsContent += '<script src="http://cdn.bootcss.com/jquery/3.1.1/jquery.min.js"></script>';
        }
        if (Setting.fancybox) {
            styleContent += '<link href="http://cdn.bootcss.com/fancybox/2.1.5/jquery.fancybox.min.css" rel="stylesheet">';
            jsContent += '<script src="http://cdn.bootcss.com/jquery-mousewheel/3.1.13/jquery.mousewheel.min.js"></script>';
            jsContent += '<script src="http://cdn.bootcss.com/fancybox/2.1.5/jquery.fancybox.min.js"></script>';
            jsContent += '<script> $(".fancybox-image").fancybox();</script>'

        }


        if (Setting.mathjax) {
            jsContent += '<script type="text/x-mathjax-config">' +
                "MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\\\(','\\\\)']]}, " +
                'TeX: {equationNumbers: {autoNumber: ["AMS"],useLabelIds: true}},' +
                '"HTML-CSS": {linebreaks: {automatic: true}},' +
                'SVG: {linebreaks: {automatic: true}}' +
                "});" +
                "</script>" +
                '<script type="text/javascript" src="http://cdn.bootcss.com/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>';
        }

        if (Setting.backtop) {
            styleContent += '<link href="http://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">';
            styleContent += ' <link rel="stylesheet" href="http://markdown.zhangjikai.com/dist/css/backtotop.min.css">';

            jsContent += '<script type="text/javascript" src="http://markdown.zhangjikai.com/dist/js/backtotop.min.js"></script>';
            jsContent += '<script type="text/javascript">backToTop.init()</script> '
        }

        if (Setting.duoshuo) {
            jsContent += '<div class="ds-thread" data-thread-key="' + dsConfig.key +
                '" data-title="' + dsConfig.title +
                '" data-url="' + dsConfig.url +
                '"></div><script type="text/javascript">var duoshuoQuery = {short_name:"' + dsConfig.short_name +
                '"};(function() {var ds = document.createElement("script");ds.type = "text/javascript";ds.async = true;ds.src = (document.location.protocol == "https:" ? "https:" : "http:") + "//static.duoshuo.com/embed.js";ds.charset = "UTF-8";(document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0]).appendChild(ds);})();</script>';
        }

        if (Setting.echarts) {

            jsContent += '<br />';
            jsContent += '<script src="http://cdn.bootcss.com/echarts/3.3.2/echarts.min.js"></script>';
            echartData.forEach(function (data) {
                var themeObj = {};

                if (data.option.theme) {
                    if (!themeObj.hasOwnProperty(data.option.theme)) {
                        if (echartThemeText.indexOf(data.option.theme) != -1) {
                            jsContent += '<script src="http://markdown.zhangjikai.com/dist/js/echarts-theme/' + data.option.theme + '.min.js"></script>';
                        }
                        themeObj[data.option.theme] = "theme";
                    }

                }
            });
            jsContent += '<br />';

            jsContent += '<script type="text/javascript"> ';
            echartData.forEach(function (data, index) {
                var theme = "";

                if (data.option.theme) {

                    theme = data.option.theme;
                }
                jsContent += 'var chart' + index + ' = echarts.init(document.getElementById("echarts-' + data.id + '"),"' + theme + '");\n' +
                    'var option' + index + ' = ' + data.previousOption + ';\n' +
                    'chart' + index + '.setOption(option' + index + ');\n';
            });
            jsContent += "</script>"


        }

        var htmlContent = '<!DOCTYPE html>' +
            '<html>' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1">' +
            '<title>' +
            mdName +
            '</title>' +
            styleContent +
            '<link rel="stylesheet" href="http://markdown.zhangjikai.com/dist/css/markdown.min.css">' +
            '</head>' +
            '<body>' +
            htmlContent +
            jsContent +
            '</body>' +
            '</html>';

        var name = mdName + ".html";
        if (Setting.format) {
            htmlContent = html_beautify(htmlContent, {indent_size: 4});
        }
        //var blob = new Blob([html_beautify(htmlContent, {indent_size: 4})], {type: "text/html;charset=utf-8"});
        var blob = new Blob([htmlContent], {type: "text/html;charset=utf-8"});
        saveAs(blob, name);
    }

    function collapseUpload() {
        $("#fold").removeClass("fa-minus-square");
        $("#fold").addClass("fa-plus-square");
        $("#upload-area").addClass("upload-area-close");
        $("#fold").attr("expand", false);
    }


    function delExtension(str) {
        return str.substr(0, str.lastIndexOf('.')) || str;
    }

    function getImgName(path) {
        return path.substr(path.lastIndexOf('/') + 1);
    }

    function getImgExtension(str) {
        return str.substr(str.lastIndexOf(".") + 1) || str;
    }

    function checkMdExt(name) {
        var re = /(\.md|\.markdown|\.txt|\.mkd|\.text)$/i;
        if (re.test(name)) {
            return true;
        } else {
            return false;
        }
    }

    function checkImgExt(name) {
        var re = /(\.png|\.jpg|\.gif|\.bmp)$/i;
        if (re.test(name)) {
            return true;
        } else {
            return false;
        }
    }

    fileSelect.addEventListener("dragenter", dragMdEnter, false);
    fileSelect.addEventListener("dragleave", dragMdLeave, false);
    fileSelect.addEventListener('drop', dropMdFile, false);
    fileSelect.addEventListener("change", selectMdFile, false);

    imgSelect.addEventListener("dragenter", dragImgEnter, false);
    imgSelect.addEventListener("dragleave", dragImgLeave, false);
    imgSelect.addEventListener('drop', dropImgFile, false);
    imgSelect.addEventListener('change', selectImages, false);


    $("#fold").click(function () {
        if ($("#fold").attr("expand") == "true") {
            $("#fold").removeClass("fa-minus-square");
            $("#fold").addClass("fa-plus-square");
            $("#upload-area").addClass("upload-area-close");
            $("#fold").attr("expand", false);
        } else {
            $("#fold").removeClass("fa-plus-square");
            $("#fold").addClass("fa-minus-square");
            $("#upload-area").removeClass("upload-area-close");
            $("#fold").attr("expand", true);
        }
    });

    $("#export").click(exportHtml);


    $("#refresh").click(function () {
        refresh();
    });

    $("#clear").click(clear);

    emojify.setConfig({
        emojify_tag_type: 'div',           // Only run emojify.js on this element
        only_crawl_id: null,            // Use to restrict where emojify.js applies
        img_dir: 'http://cdn.bootcss.com/emojify.js/1.0/images/basic',  // Directory for emoji images
        ignored_tags: {                // Ignore the following tags
            'SCRIPT': 1,
            'TEXTAREA': 1,
            'A': 1,
            'PRE': 1,
            'CODE': 1
        }
    });

    backToTop.init({
        theme: 'classic', // Available themes: 'classic', 'sky', 'slate'
        animation: 'fade' // Available animations: 'fade', 'slide'
    });

    loadSetting();
    addSetting();
    loadCacheFile();


}());

