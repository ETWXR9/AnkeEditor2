//https://www.electron.build/configuration/configuration#afterpack
exports.default = async function (context) {   //console.log(context)
    // var fs = require('fs');
    // //delete all locales except en-US and zh-CN
    // var localeDir = context.appOutDir + '/locales/';
    // fs.readdir(localeDir, function (err, files) {
    //     if (!(files && files.length)) return;
    //     for (var i = 0, len = files.length; i < len; i++) {
    //         var match = files[i].match(/(en-US|zh-CN)\.pak/);
    //         if (match === null) {
    //             fs.unlinkSync(localeDir + files[i]);
    //         }
    //     }
    // });
    // //delete d3dcompiler_47.dll
    // var d3dcompiler_47 = context.appOutDir + '/d3dcompiler_47.dll';
    // if (fs.existsSync(d3dcompiler_47)) {
    //     fs.unlinkSync(d3dcompiler_47);
    // }
} 
