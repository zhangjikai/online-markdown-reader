/**
 * Created by ZhangJikai on 2016/12/25.
 */

(function () {
    var fileSelect = document.getElementById('select-file');
    var imgSelect = document.getElementById('img-select');
    var cacheImages = {};
    var targetFile;
    var filename = "";

    var renderer = new marked.Renderer();

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


    var toc = []; // your table of contents as a list.
    var tocLevel = 5;
    var tocDumpIndex = 0;
    var tocStr = "";

    renderer.heading = function (text, level) {

        var slug = text.toLowerCase().replace(/[\s]+/g, '-');

        if(tocStr.indexOf(slug) != -1) {
            slug += "-" + tocDumpIndex;
            tocDumpIndex++;

        }
        tocStr += slug;
        toc.push({
            level: level,
            slug: slug,
            title: text
        });

        /*return "<h" + level + " id=\"" + slug + "\"><a href=\"#" + slug + "\" class=\"anchor\">"  + "</a>" + text + "</h" + level + ">";*/
        return "<h" + level + " id=\"" + slug + "\"><a href=\"#" + slug + "\" class=\"anchor\">" + '' +
            '<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>' +
            '' + "</a>" + text + "</h" + level + ">";

       /* return "<h" + level + " id=\"" + slug + "\">" + '' +
         '<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>' +
         '' + "<a href=\"#" + slug + "\" class=\"anchor\"></a>" + text + "</h" + level + ">";

        return "<h" + level + "><a href=\"#" + slug + "\" class=\"anchor\">" + '' +
         '<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>' +
         '' + "</a>" + '<span id="' + slug + '">&nbsp;</span>' + text + "</h" + level + ">";*/
    };

    var codeFun = renderer.code;
    renderer.code = function (code, language) {
        if(language == "latex") {
            console.log(code);
            return "<div class='diagram' id='diagram'>" + code+"</div>"
        } else {
            return codeFun.call(this, code, language);
        }

    };

    marked.setOptions({
        renderer: renderer,
        gfm: true
        /*highlight: function (code) {
            var value = hljs.highlightAuto(code).value;
            return value;
        }*/
    });


    //refreshAuto();
    function refreshAuto() {
        /*var int = self.setInterval(click, 3000)*/
        setInterval(load, 3000);
    }


    function load() {
        if (targetFile == null) {
            return;
        }
        var reader = new FileReader();
        reader.readAsText(targetFile);
        filename = delExtension(targetFile.name);

        reader.onload = function (e) {
            document.getElementById("content").innerHTML = marked(e.target.result);
            /*$('pre code').each(function (i, block) {
                hljs.highlightBlock(block);
            });*/
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, "content"]);
        }
    }
    function dragEnter(e) {
        e.stopPropagation();
        e.preventDefault();
        //drop.style.borderColor = "#3bafda";
        $("#upload").css("border-color", "#3bafda");
    }

    function dragLeave(e) {
        e.stopPropagation();
        e.preventDefault();
        $("#upload").css("border-color", "#ddd");
    }

    function readDropFile(e) {

        e.stopPropagation();
        e.preventDefault();


        $("#upload").css("border-color", "#ddd");

        var reader = new FileReader();
        //reader.readAsText(e.originalEvent.dataTransfer.files[0]);
        //filename = delExtension(e.originalEvent.dataTransfer.files[0].name);
        targetFile = e.dataTransfer.files[0];
        if (!checkMdExt(targetFile.name)) {
            var ins = $('[data-remodal-id=md-tip]').remodal();
            ins.open();
            return;
        }
        $("#loader").css("display", "block");
        reader.readAsText(targetFile);
        filename = delExtension(e.dataTransfer.files[0].name);

        reader.onload = function (e) {


            var mdContent = e.target.result;
            console.log(mdContent.indexOf("<!-- toc -->"));
            $("#loader").css("display", "none");


            saveFile(filename, e.target.result);
            toc.length = 0;
            document.getElementById("content").innerHTML = marked(e.target.result);
            //$('pre code').each(function (i, block) {
            //    hljs.highlightBlock(block);
            //});

            $("pre").addClass("line-numbers");
            Prism.highlightAll();
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, "content"]);
            collapseUpload();
            genToc();
            $("#loader").css("display", "none");
        }
    }

    function readSelectFile(e) {
        e.stopPropagation();
        e.preventDefault();

        if (this.files == null || this.files[0] == null) {
            return;
        }

        filename = delExtension(this.files[0].name);
        var reader = new FileReader();
        reader.readAsText(this.files[0]);
        reader.onload = function (e) {
            saveFile(filename, e.target.result);
            document.getElementById("content").innerHTML = marked(e.target.result);
            $('pre code').each(function (i, block) {
                hljs.highlightBlock(block);
            });
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, "content"]);
            collapseUpload();
        }
    }


    function imgDragEnter(e) {
        e.stopPropagation();
        e.preventDefault();
        //drop.style.borderColor = "#3bafda";
        $("#img-upload").css("border-color", "#3bafda");
    }

    function imgDragLeave(e) {
        e.stopPropagation();
        e.preventDefault();
        $("#img-upload").css("border-color", "#ddd");
    }

    function imgDrop(e) {

        e.stopPropagation();
        e.preventDefault();

        var inst = $('[data-remodal-id=modal]').remodal();
        inst.close();
        $("#img-upload").css("border-color", "#ddd");
        //console.log(e);

        var files = e.dataTransfer.files;

        var length = files.length;


        var i, index = 0;

        for (i = 0; i < files.length; i++) {
            if (!checkImgExt(files[i].name)) {
                var inst = $('[data-remodal-id=img-tip]').remodal();
                inst.open();
                return;
            }
        }
        $("#loader").css("display", "block");
        for (i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.readAsDataURL(file);
            (function (reader, file) {
                reader.onload = function (e) {

                    if (!cacheImages.hasOwnProperty(file.name)) {
                        //console.log(222);
                        //cacheImages[file.name] = e.target.result;
                        var image = new Image();
                        image.src = e.target.result;
                        var ext = getImgExtension(file.name);
                        var format = "image/png";
                        if (ext.toLowerCase() == "jpg" || ext.toLowerCase() == "jpeg") {
                            format = "image/jpeg";
                        }
                        // console.log(format);
                        cacheImages[file.name] = compressImage(image, format);
                        /*image.src = compressImage(image, format);
                         $("#content").prepend(image);*/
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
            var imgSrc = images[i].src;
            var imgName = getImgName(imgSrc);
            if (cacheImages.hasOwnProperty(imgName)) {
                images[i].src = cacheImages[imgName];

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

        console.log(format);
        // calculate the width and height, constraining the proportions

        if (width > max_width) {
            //height *= max_width / width;
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


    function genToc() {
        console.log(toc);
        var lastLevel = 0;
        var i, j, singleToc;
        var tocHtml = "";
        var ulCount = 0;



        for (i = 0; i < toc.length; i++) {
            singleToc = toc[i];

            if(singleToc.level > tocLevel) {
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
                for (j = singleToc.level -lastLevel; j > 0; j--) {
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

        $("#content").prepend(tocHtml);


    }


    function click() {
        //console.log(111);
        if ("createEvent" in document) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            fileSelect.dispatchEvent(evt);
        } else {
            fileSelect.fireEvent("onchange");
        }
    }


    function saveFile(filename, data) {
        localStorage.setItem("filename", filename);
        localStorage.setItem("file", data);
    }

    function loadCacheFile() {

        var file = localStorage.getItem("file");
        filename = localStorage.getItem("filename");
        //alert(filename);

        if (file == null || file == "") {
            $("#loader").css("display", "none");
            return;
        }




        var heading =  /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/igm;
        var match, index = 0;
       /* console.log(heading.exec(file));*/
        /*while((match = heading.exec(file)) != null) {
            console.log(match.index)
            index++;
        }*/
        console.log(index);
        toc.length = 0;
        document.getElementById("content").innerHTML = marked(file);

        $("pre").addClass("line-numbers");
        Prism.highlightAll();
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "content"]);

        /*var options = {theme: 'hand'};

        $(".diagram").sequenceDiagram({theme: 'hand'});*/
        collapseUpload();

       // emojify.run(document.getElementById('content'))
        //anchors.add();


        $("#loader").css("display", "none");
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


    fileSelect.addEventListener("dragenter", dragEnter, false);
    fileSelect.addEventListener("dragleave", dragLeave, false);
    fileSelect.addEventListener('drop', readDropFile, false);
    fileSelect.addEventListener("change", readSelectFile, false);

    imgSelect.addEventListener("dragenter", imgDragEnter, false);
    imgSelect.addEventListener("dragleave", imgDragLeave, false);
    imgSelect.addEventListener('drop', imgDrop, false);

    //$("#select-file").on("dragenter", dragEnter);
    //$("#select-file").on("dragleave", dragLeave);
    //$("#select-file").on("drop", fileDrop);
    //$("#select-file").on("change", fileSelect);

    $("#fold").click(function () {

        console.log($("#fold").attr("expand"));
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

    $("#export").click(function () {
        /*console.log("export");*/

        var htmlContent = localStorage.getItem("file");
        htmlContent = marked(htmlContent);

        var htmlContent = '<!DOCTYPE html>' +
            '<html>' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1">' +
            '<title>markdown</title>' +
            '<link href="http://cdn.bootcss.com/highlight.js/9.8.0/styles/atom-one-light.min.css" rel="stylesheet">' +
            '<link rel="stylesheet" href="http://10.64.0.124:81/assets/css/markdown.css">' +
            '</head>' +
            '<body>' +
                htmlContent +
           /* $("#content").html() +*/
            '<script type="text/x-mathjax-config">' +
            "MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\\\(','\\\\)']]}});" +
            "</script>" +
            '<script type="text/javascript" src="http://cdn.bootcss.com/mathjax/2.7.0/MathJax.js?config=TeX-AMS_CHTML"></script>' +
            '</body>' +
            '</html>';

        var name = filename + ".html";
        var blob = new Blob([html_beautify(htmlContent, {indent_size: 4})], {type: "text/html;charset=utf-8"});
        //var blob = new Blob([htmlContent], {type: "text/html;charset=utf-8"});
        saveAs(blob, name);
    });

    $("#refresh").click(function () {
        if (targetFile == null) {
            return;
        }
        var reader = new FileReader();
        reader.readAsText(targetFile);
        filename = delExtension(targetFile.name);

        reader.onload = function (e) {
            document.getElementById("content").innerHTML = marked(e.target.result);
            $('pre code').each(function (i, block) {
                hljs.highlightBlock(block);
            });
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, "content"]);
        }
    });

    /*emojify.setConfig({

        emojify_tag_type : 'div',           // Only run emojify.js on this element
        only_crawl_id    : null,            // Use to restrict where emojify.js applies
        img_dir          : 'http://10.64.0.124:81/assets/lib/emojify.js/dist/images/basic',  // Directory for emoji images
        ignored_tags     : {                // Ignore the following tags
            'SCRIPT'  : 1,
            'TEXTAREA': 1,
            'A'       : 1,
            'PRE'     : 1,
            'CODE'    : 1
        }
    });*/
    loadCacheFile();
    //genToc();
    backToTop.init({
        theme: 'classic', // Available themes: 'classic', 'sky', 'slate'
        animation: 'fade' // Available animations: 'fade', 'slide'
    });

}());

