/**
 * Created by ZhangJikai on 2016/12/25.
 */

(function () {
    var fileSelect = document.getElementById('select-file');
    var imgSelect = document.getElementById('img-select');
    var cacheImages = {};
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

    renderer.heading = function (text, level) {
        var slug = text.toLowerCase().replace(/[^\w]+/g, '-');
        toc.push({
            level: level,
            slug: slug,
            title: text
        });
        return "<h" + level + " id=\"" + slug + "\"><a href=\"#" + slug + "\" class=\"anchor\"></a>" + text + "</h" + level + ">";
    };

    /*renderer.code = function(code, language) {
        return "<pre><code class='"+ language+"'>" + code +"</code></pre>"
    };*/

    marked.setOptions({
        renderer: renderer,
        gfm: true
        //highlight: function (code) {
        //    console.log(code)
        //    var value = hljs.highlightAuto(code).value;
        //    return value;
        //}
    });


    function refreshAuto() {
        var int = self.setInterval(click, 3000)
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

    function fileDrop(e) {

        e.stopPropagation();
        e.preventDefault();

        //drop.style.borderColor = "#ddd";
        $("#upload").css("border-color", "#ddd");
        console.log(e);
        var reader = new FileReader();
        //reader.readAsText(e.originalEvent.dataTransfer.files[0]);
        //filename = delExtension(e.originalEvent.dataTransfer.files[0].name);

        reader.readAsText(e.dataTransfer.files[0]);
        var obj = e.dataTransfer.files[0];
        console.log("file", JSON.stringify(obj));

        filename = delExtension(e.dataTransfer.files[0].name);

        reader.onload = function (e) {
            saveFile(e.target.result);
            document.getElementById("content").innerHTML = marked(e.target.result);
            $('pre code').each(function(i, block) {
                hljs.highlightBlock(block);
            });
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, "content"]);
            collapseUpload();
        }
    }

    function fileSelect(e) {
        e.stopPropagation();
        e.preventDefault();

        if (this.files == null || this.files[0] == null) {
            return;
        }
        var reader = new FileReader();
        reader.readAsText(this.files[0]);
        reader.onload = function (e) {
            document.getElementById("content").innerHTML = marked(e.target.result);
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
        console.log(length);
        var i, index = 0;

        for(i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            var fileName = file.name;
            reader.readAsDataURL(file);
            (function(reader, file) {
                reader.onload = function (e) {

                    if(!cacheImages.hasOwnProperty(file.name) ) {
                        //console.log(222);
                        cacheImages[file.name] = e.target.result;
                    }
                    index++;
                    if(index == length) {
                        replaceImage();
                    }
                }
            })(reader, file);
        }
    }


    function replaceImage() {
        var images = $("img");
        var i;
        for(i = 0; i < images.length; i++) {
            var imgSrc = images[i].src;
            var imgName = getImgName(imgSrc);
            if(cacheImages.hasOwnProperty(imgName)) {
                images[i].src = cacheImages[imgName];
            }
        }
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


    function saveFile(data) {
        localStorage.setItem("file", data);
    }

    function loadCacheFile() {
        var file = localStorage.getItem("file");
        if (file == null || file == "") {
            return;
        }

        document.getElementById("content").innerHTML = marked(file);
        $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "content"]);
        collapseUpload();
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
        return path.substr( path.lastIndexOf('/') + 1) ;
    }

    fileSelect.addEventListener("dragenter", dragEnter, false);
    fileSelect.addEventListener("dragleave", dragLeave, false);
    fileSelect.addEventListener('drop', fileDrop, false);
    fileSelect.addEventListener("change", fileSelect, false);

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
        var htmlContent = '<!DOCTYPE html>' +
            '<html>' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1">' +
            '<title>markdown</title>' +
            '<link href="http://cdn.bootcss.com/highlight.js/9.8.0/styles/atom-one-light.min.css" rel="stylesheet">' +
            '<link rel="stylesheet" href="http://markdown.zhangjikai.com/assets/css/markdown.css">' +
            '</head>' +
            '<body>' +
            $("#content").html() +
            '<script type="text/x-mathjax-config">' +
            "MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});" +
            "</script>" +
            '<script type="text/javascript" src="http://cdn.bootcss.com/mathjax/2.7.0/MathJax.js?config=TeX-AMS_CHTML"></script>' +
            '</body>' +
            '</html>';

        var name = filename + ".html";
        var blob = new Blob([html_beautify(htmlContent, {indent_size: 4})], {type: "text/html;charset=utf-8"});
        saveAs(blob, name);
    });

    $("#setting").click(function() {

    });

    loadCacheFile();
    /*$('#setting').magnificPopup({
        type: 'modal'

    });*/




}());
