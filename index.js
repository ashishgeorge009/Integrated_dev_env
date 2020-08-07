const $ = require("jquery");
require("jstree");
const path = require("path");
const fs = require("fs");
let myMonaco;
let tabArr = {};
let editor;
const pty = require('node-pty');
const os=require("os");
const Terminal = require('xterm').Terminal;
let { FitAddon } = require('xterm-addon-fit');
const dialog = require("electron").remote.dialog;
let filename;

$(document).ready( async function(){

    editor = await createEditor();
    
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
            setData(fPath);
            
            createTab(fPath);
        }
        
    })


    const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env
    });

    // Initialize xterm.js and attach it to the DOM
    const xterm = new Terminal();
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);

    xterm.open(document.getElementById('terminal'));
    // Setup communication between xterm.js and node-pty
    xterm.onData(function (data) {
        ptyProcess.write(data);
       

    })
    ptyProcess.on('data', function (data) {
        xterm.write(data);
        
    });
    fitAddon.fit();
    // myMonaco.editor.defineTheme('myCustomTheme', {
    //     base: 'vs', // can also be vs-dark or hc-black
    //     inherit: true, // can also be false to completely replace the builtin rules
    //     rules: [
    //         { token: 'comment', foreground: 'ffa500', fontStyle: 'italic underline' },
    //         { token: 'comment.js', foreground: '008800', fontStyle: 'bold' },
    //         { token: 'comment.css', foreground: '0000ff' } // will inherit fontStyle from `comment` above
    //     ],
    //     colors: {
    //         'editor.foreground': '#000000',
    //         'editor.background': '#EDF9FA',
    //         'editorCursor.foreground': '#8B0000',
    //         'editor.lineHighlightBackground': '#0000FF20',
    //         'editorLineNumber.foreground': '#008800',
    //         'editor.selectionBackground': '#88000030',
    //         'editor.inactiveSelectionBackground': '#88000015'
    //     }
    // });

    $(".check").on("change",function(){
        if(this.checked){
            myMonaco.editor.setTheme("vs-dark");
        }
        else{
            myMonaco.editor.setTheme("vs");

        }
        // myMonaco.editor.setTheme(this.value);

    })
    $("#New").click( async function(){
        try{
        let sdb = await dialog.showSaveDialog();
        let fp = sdb.filePath;
        fs.writeFileSync(fp,"");
        console.log(fp)
        saveNewFile(fp);
        }catch(err){
            console.log(err)
        }
        // setData(fp);
        // createTab(fp);
        // // console.log(fp)
        // console.log(path.parse(fp).dir)
        // let obj = {
        //     id: fp,
        //     parent: path.parse(fp).dir,
        //     text: path.parse(fp).base
        // };
        // let doesExist = $('#tree').jstree(true).get_node(fp); // if that childrens are already created
        //         if(doesExist){
        //             return;
        //         }
        //         // create logic
        //         $("#tree").jstree().create_node(path.parse(fp).dir, obj, "last");

    })
    $("#Save").click(async function(){
        code = editor.getModel().getValue();
        if(filename){
            fs.writeFileSync(filename,code);
            alert(`${path.parse(filename).base} is saved`)
        }else{
            try{
            let sdb = await dialog.showSaveDialog();
            let fp = sdb.filePath;
            fs.writeFileSync(fp,code);
            saveNewFile(fp)
            alert(`${path.parse(fp).base} is saved`)
            }catch(err){
                console.log(err);
            }
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
function setData(fPath){
    let content = fs.readFileSync(fPath,"utf-8");
            // console.log(content);
            editor.getModel().setValue(content);
            var model = editor.getModel();
            let ext = fPath.split(".").pop();
            if(ext == "js"){
                ext = "javascript"
            }
            if(ext == "py"){
                ext = "python"
            }

            monaco.editor.setModelLanguage(model,ext);

}



function createEditor(){
    const amdLoader = require('./node_modules/monaco-editor/min/vs/loader.js');
    const amdRequire = amdLoader.require;
    const amdDefine = amdLoader.require.define;
    amdRequire.config({
        baseUrl: './node_modules/monaco-editor/min'
    });
    console.log(amdLoader);
    // workaround monaco-css not understanding the environment
    self.module = undefined;

    return new Promise(function(resolve,reject){
    amdRequire(['vs/editor/editor.main'], function () {
        var editor = monaco.editor.create(document.getElementById('text-editor'), {
            value: [
                'function x() {',
                '\tconsole.log("Hello world!");',
                '}'
            ].join('\n'),
            language: 'javascript',
            theme: "vs-dark"
        });
        myMonaco = monaco;
        resolve(editor);
    });
})
}

function createTab(fPath) {
    filename = fPath;
    let fName = path.basename(fPath);
    if (!tabArr[fPath]) {
        $("#tabs-row").append(`<div class="tab">
        <div class="tab-name" id=${fPath} onclick=handleTab(this)>${fName}</div>
        <i class="fas fa-times" id=${fPath} onclick=handleClose(this)></i>
        </div>`);
        tabArr[fPath] = fName;
    }
}
function handleTab(elem) {
    let fPath = $(elem).attr("id");
    filename = fPath;
    setData(fPath);
}
function handleClose(elem) {
    let fPath = $(elem).attr("id");
    delete tabArr[fPath];
    $(elem).parent().remove();
 fPath =$(".tab .tab-name").eq(0).attr("id");
    filename = fPath;
    if(fPath){
        setData(fPath);
    }else{
        editor.getModel().setValue("");
    }
}
function saveNewFile(fp){
        setData(fp);
        createTab(fp);
        // console.log(fp)
        console.log(path.parse(fp).dir)
        let obj = {
            id: fp,
            parent: path.parse(fp).dir,
            text: path.parse(fp).base
        };
        let doesExist = $('#tree').jstree(true).get_node(fp); // if that childrens are already created
                if(doesExist){
                    return;
                }
                // create logic
                $("#tree").jstree().create_node(path.parse(fp).dir, obj, "last");
}