var eejs = require('ep_etherpad-lite/node/eejs/');

exports.eejsBlock_scripts = function(hook_name, args, cb) {
    //args.content = args.content + "<script src='../static/plugins/ep_codepad/static/js/buttons.js'></script>";
    args.content += eejs.require("ep_codepad/templates/menuLeftScripts.ejs");
    return cb();
};

exports.eejsBlock_styles = function(hook_name, args, cb) {
    args.content += "<link href='../static/plugins/ep_codepad/static/css/button.css' rel='stylesheet'>";
    args.content += "<link rel='stylesheet' href='/static/plugins/ep_codepad/static/css/font-awesome.min.css'>";
    return cb();
};
