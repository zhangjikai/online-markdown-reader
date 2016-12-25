/**
 * Created by ZhangJikai on 2016/12/25.
 */

//hljs.initHighlightingOnLoad();
//hljs.initLineNumbersOnLoad();
var selectFile = document.getElementById('select-file');
var drop = document.getElementById("drop");


/* task list */
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

marked.setOptions({
    renderer: renderer,
    gfm: true,
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
    drop.style.borderColor = "#5cb8b9";
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
    }

}

function click() {
    console.log(111);
    if ("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        selectFile.dispatchEvent(evt);
    }
    else
        selectFile.fireEvent("onchange");
}


function selectChange(e) {
    e.stopPropagation();
    e.preventDefault();
    //console.log(222);

    //drop.style.borderColor = "#ddd";
    if (this.files == null || this.files[0] == null) {
        return;
    }
    console.log(333);
    var reader = new FileReader();

    reader.readAsText(this.files[0]);
    reader.onload = function (e) {
        document.getElementById("content").innerHTML = marked(e.target.result);
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "content"]);
    }
}

selectFile.addEventListener("dragenter", dragEnter, false);
selectFile.addEventListener("dragleave", dragLeave, false);
selectFile.addEventListener('drop', fileSelect, false);
selectFile.addEventListener("change", selectChange, false);
//refreshAuto();