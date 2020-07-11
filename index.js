const $ = require("jquery");
require("jstree");
const nodePath = require("path");

$(document).ready(function(){


    //tree view
    let currPath = process.cwd();
    console.log(currPath);
    console.log(getName(currPath));

    let data = [];
    data.push({
        id : currPath,
        parent : "#",
        text : getName(currPath)
    })

    $("#file-explorer").jstree({
        "core": {
            "data" : data
        }
    })
})

function getName(path){
    return nodePath.basename(path);
}