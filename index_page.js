var eejs = require('ep_etherpad-lite/node/eejs');
var settings = require('ep_etherpad-lite/node/utils/Settings'); // Extend index for folder support. It will redirect to urlencoded path names. 

// theme from settings
var theme = 'Default';

if (settings.ep_codepad) {
    if (settings.ep_codepad.theme) {
        theme = settings.ep_codepad.theme;
    }
}

exports.eejsBlock_indexWrapper = function(hook_name, args, cb) {
    args.content = args.content + eejs.require("ep_codepad/templates/index_page.ejs", {
        theme: theme
    });
    return cb();
};