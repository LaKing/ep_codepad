var eejs = require('ep_etherpad-lite/node/eejs');
var settings = require('ep_etherpad-lite/node/utils/Settings'); // Extend index for folder support. It will redirect to urlencoded path names. 
var fs = require('fs');

// theme from settings
var theme = 'Default';

if (settings.ep_codepad) {
    if (settings.ep_codepad.theme) {
        theme = settings.ep_codepad.theme;
    }
}

// read themes directory
var themes;
fs.readdir(__dirname+"/static/css/theme", function (err, files) {
  if (err) throw err;
  themes = files;
  var item;
  for (var i in files) {
      themes[i]=files[i].split('.')[0];
  }
});


exports.eejsBlock_indexWrapper = function(hook_name, args, cb) {
        
    args.content = args.content + eejs.require("ep_codepad/templates/index_page.ejs", {
        theme: theme,
        themes: themes
    });
    return cb();
};
