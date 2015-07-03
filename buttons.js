var eejs = require('ep_etherpad-lite/node/eejs/');
var settings = require('ep_etherpad-lite/node/utils/Settings');
// codepad installation folder
var cif = '';

if (settings.ep_codepad) {
    if (settings.ep_codepad.installation_folder) {
        cif = settings.ep_codepad.installation_folder;
    }
}

exports.eejsBlock_scripts = function(hook_name, args, cb) {
    //args.content = args.content + "<script src='../static/plugins/ep_codepad/static/js/buttons.js'></script>";
    args.content += eejs.require("ep_codepad/templates/menuLeftScripts.ejs", {
        cif: cif
    });
    return cb();
};

exports.eejsBlock_styles = function(hook_name, args, cb) {
    args.content += "<link href='../static/plugins/ep_codepad/static/css/button.css' rel='stylesheet'>";
    args.content += "<link rel='stylesheet' href='../static/plugins/ep_codepad/static/css/font-awesome.min.css'>";
    return cb();
};