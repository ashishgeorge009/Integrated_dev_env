const $ = require("jquery");
require("jstree");
const path = require("path");
const fs = require("fs");


$(document).ready(function(){


    //tree view
    let pPath = process.cwd();
    console.log(pPath);
    // console.log(getName(pPath));
    name = path.basename(pPath);
    let data = [{
        id : pPath,
        parent : "#",
        text : name
    }]
    
    let childArr = addCh(pPath);
    data = [...data, ...childArr] //  data.concat(childArr)  // ...data => all the elements in data array

    $("#tree").jstree({
        "core": {
            "check_callback" : true,
            "themes":{
                "icons":false
            },
            "data" : data
        }
    }).on("open_node.jstree",
    function (e, onClickdata) {
        // console.log(onClickdata);
        // let cNodePath = data.node.id;
        // let cArr = createData(cNodePath);
        // for (let i = 0; i < cArr.length; i++) {
        //     console.log(cArr[i]);
        //     $('#tree').jstree().create_node(cNodePath, cArr[i], "last");

        // }
        let children = onClickdata.node.children;
        for (let i = 0; i < children.length; i++) {
            let gcArr = addCh(children[i]);
            for (let j = 0; j < gcArr.length; j++) {
                let doesExist = $('#tree').jstree(true).get_node(gcArr[j].id); // if that childrens are already created
                if(doesExist){
                    return;
                }
                // create logic
                $("#tree").jstree().create_node(children[i], gcArr[j], "last");
                // data.push(gcArr);
                // console.log(data)
            }
        }
    }).on("select_node.jstree",
    function(e,dataObj){
        let fPath = dataObj.node.id;
        let isFile = fs.lstatSync(fPath).isFile();
        if (isFile) {
            let content = fs.readFileSync(fPath,"utf-8");
            console.log(content);
            
        }
    })


})

function getName(pathname){
    return path.basename(pathname);
}
function addCh(parentPath) {
    let isDir = fs.lstatSync(parentPath).isDirectory();
    if (isDir == false) {
        return [];
    }

    let childrens = fs.readdirSync(parentPath);
    let cdata = [];
    for (let i = 0; i < childrens.length; i++) {
        let cPath = path.join(parentPath, childrens[i]);
        let obj = {
            id: cPath,
            parent: parentPath,
            text: childrens[i]
        };
        cdata.push(obj);
    }
    return cdata;
}