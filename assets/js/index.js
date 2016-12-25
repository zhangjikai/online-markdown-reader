/**
 * Created by ZhangJikai on 2016/12/25.
 */

var selectFile = document.getElementById('select-file');
var drop = document.getElementById("drop");



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
    reader.readAsDataURL(this.files[0]);
    reader.onload = function (e) {
        var image = new Image();
        image.src = e.target.result;
        transfer(image);

    }
}
selectFile.addEventListener("dragenter", dragEnter, false);
selectFile.addEventListener("dragleave", dragLeave, false);
selectFile.addEventListener('drop', fileSelect, false);
selectFile.addEventListener("change", selectChange, false);