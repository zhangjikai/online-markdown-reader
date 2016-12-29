/**
 * Created by ZhangJikai on 2016/12/25.
 */

(function () {
    var selectFile = document.getElementById('select-file');
    var drop = document.getElementById("drop");

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

    function fileSelect(e) {

        e.stopPropagation();
        e.preventDefault();

        drop.style.borderColor = "#ddd";
        var reader = new FileReader();
        reader.readAsText(e.dataTransfer.files[0]);
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


    function selectChange(e) {
        e.stopPropagation();
        e.preventDefault();
        //console.log(222);

        //drop.style.borderColor = "#ddd";
        if (this.files == null || this.files[0] == null) {
            return;
        }
        //console.log(333);
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

    selectFile.addEventListener("dragenter", dragEnter, false);
    selectFile.addEventListener("dragleave", dragLeave, false);
    selectFile.addEventListener('drop', fileSelect, false);
    selectFile.addEventListener("change", selectChange, false);


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


}());
