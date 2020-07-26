const $ = require("jquery");
require("jstree");
const path = require("path");
const fs = require("fs");


$(document).ready(function(){


    //tree view
    let pPath = process.cwd();
    console.log(pPath);
    console.log(getName(pPath));
    name = path.basename(pPath);
    let data = [{
        id : pPath,
        parent : "#",
        text : name
    }]
    
    let childArr = createData(pPath);
    data = [...data, ...childArr] //  data.concat(childArr)  // ...data => all the elements in data array

    $("#tree").jstree({
        "core": {
            "check_callback" : true,
            "data" : data
        }
    }).on("select_node.jstree",
    function (e, data) {

        let cNodePath = data.node.id;
        let cArr = createData(cNodePath);
        for (let i = 0; i < cArr.length; i++) {
            console.log(cArr[i]);
            $('#tree').jstree().create_node(cNodePath, cArr[i], "last");

        }
    })


})

function getName(pathname){
    return path.basename(pathname);
}
function createData(parent) {
    let childrens = fs.readdirSync(parent);
    let cdata = [];
    for (let i = 0; i < childrens.length; i++) {
        let id = path.join(parent, childrens[i]);
        let obj = {
            id: id,
            parent: parent,
            text: childrens[i]
        };
        cdata.push(obj);
    }
    return cdata;
}