/**
 * Created by ZhangJikai on 2016/12/25.
 */

//hljs.initHighlightingOnLoad();
//hljs.initLineNumbersOnLoad();
var selectFile = document.getElementById('select-file');
var drop = document.getElementById("drop");

marked.setOptions({
    highlight: function (code) {
        var value = hljs.highlightAuto(code).value;
        return value;
    }
});

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
    }

}

function selectChange(e) {
    e.stopPropagation();
    e.preventDefault();

    drop.style.borderColor = "#ddd";
    var reader = new FileReader();
    reader.readAsText(this.files[0]);
    reader.onload = function (e) {
        document.getElementById("content").innerHTML = marked(e.target.result);
    }
}
selectFile.addEventListener("dragenter", dragEnter, false);
selectFile.addEventListener("dragleave", dragLeave, false);
selectFile.addEventListener('drop', fileSelect, false);
selectFile.addEventListener("change", selectChange, false);