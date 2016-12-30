/**
 * Created by ZhangJikai on 2016/12/25.
 */

(function () {
    var selectFile = document.getElementById('select-file');
    var drop = document.getElementById("upload");
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

    marked.setOptions({
        renderer: renderer,
        gfm: true,
        heading: true,
        highlight: function (code) {
            var value = hljs.highlightAuto(code).value;
            return value;
        }
    });


    function refreshAuto() {
        var int = self.setInterval(click, 3000)
    }

    function dragEnter(e) {
        e.stopPropagation();
        e.preventDefault();
        drop.style.borderColor = "#3bafda";
    }

    function dragLeave(e) {
        e.stopPropagation();
        e.preventDefault();
        drop.style.borderColor = "#ddd";
    }

    function fileDrop(e) {

        e.stopPropagation();
        e.preventDefault();

        drop.style.borderColor = "#ddd";
        var reader = new FileReader();
        reader.readAsText(e.dataTransfer.files[0]);
        //console.log(e.dataTransfer.files[0]);
        filename = delExtension(e.dataTransfer.files[0].name);
        //filename = delExtension(filename);
        //console.log(filename)
        reader.onload = function (e) {

            document.getElementById("content").innerHTML = marked(e.target.result);
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, "content"]);
            collapseUpload();
        }
    }

    function click() {
        //console.log(111);
        if ("createEvent" in document) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            selectFile.dispatchEvent(evt);
        } else {
            selectFile.fireEvent("onchange");
        }
    }


    //function exportHtml() {
    //    console.log(222);
    //}


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


    function collapseUpload() {
        $("#fold").removeClass("fa-minus-square");
        $("#fold").addClass("fa-plus-square");
        $("#upload-area").addClass("upload-area-close");
        $("#fold").attr("expand", false);
    }


    function delExtension(str) {
        /*var reg = /^(.+)(\.[^ .]+)?$/;
         return str.replace(reg, '');*/
        return str.substr(0, str.lastIndexOf('.')) || str;
    }

    selectFile.addEventListener("dragenter", dragEnter, false);
    selectFile.addEventListener("dragleave", dragLeave, false);
    selectFile.addEventListener('drop', fileDrop, false);
    selectFile.addEventListener("change", fileSelect, false);

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
            '<script type="text/javascript" async src="http://cdn.bootcss.com/mathjax/2.7.0/MathJax.js?config=TeX-AMS_CHTML"></script>' +
            '</body>' +
            '</html>';


        //console.log(html_beautify(htmlContent, {indent_size: 4}));
        var name = filename + ".html";
        var blob = new Blob([html_beautify(htmlContent, {indent_size: 4})], {type: "text/html;charset=utf-8"});
        saveAs(blob, name);
    })

}());
