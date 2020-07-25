fs = require("fs")
path = require("path")
pPath = process.cwd();
let cd = path.join(pPath,"package.json");
    try{
    let hell = fs.readdirSync(cd);
    console.log(hell)
    }catch(err){
        console.log(err)
        console.log("zero")
        // return 0;
    }
