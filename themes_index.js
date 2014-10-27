var eejs = require('ep_etherpad-lite/node/eejs');
var settings = require('ep_etherpad-lite/node/utils/Settings');

function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i + 1);
}

var theme = "Default";
if (settings.ep_codepad)
    if (settings.ep_codepad.theme) theme = settings.ep_codepad.theme;

exports.eejsBlock_scripts = function(hook_name, args, cb) {
    //args.content = args.content + eejs.require("ep_codepad/templates/syntaxHighlightingScripts.ejs");

    args.content += '<script src="/static/plugins/ep_codepad/static/js/highlight.codepad.js"></script>';

    return cb();
};

exports.eejsBlock_styles = function(hook_name, args, cb) {

    var res_send = '';

    res_send += '<script src="/static/plugins/ep_codepad/static/js/cookies.js" type="text/javascript"></script>';
    res_send += '<script type="text/javascript">';
    res_send += 'var theme = "' + theme + '";';
    res_send += 'if (getCookie("codepad_theme") !== "") theme = getCookie("codepad_theme");';
    res_send += 'document.write(\'<link rel="stylesheet" type="text/css" href="/static/plugins/ep_codepad/static/css/theme/\'+theme+\'.css">\');';
    res_send += '</script>';

    // highlight.js
    res_send += '<link rel="stylesheet" href="/static/plugins/ep_codepad/static/css/styles/atelier-dune.dark.css">';

    args.content = args.content + res_send;
    return cb();

};

exports.eejsBlock_timesliderStyles = function(hook_name, args, cb) {
    var res_send = '';
    res_send += '<script src="/static/plugins/ep_codepad/static/js/cookies.js" type="text/javascript"></script>';
    res_send += '<script type="text/javascript">';
    res_send += 'var theme = "' + theme + '";';
    res_send += 'if (getCookie("codepad_theme") !== "") theme = getCookie("codepad_theme");';
    res_send += 'document.write(\'<link rel="stylesheet" type="text/css" href="/static/plugins/ep_codepad/static/css/theme/\'+theme+\'.css">\');';
    res_send += '</script><link rel="stylesheet" type="text/css" href="/static/plugins/ep_codepad/static/css/timeslider.css">';

    args.content = args.content + res_send;
    return cb();
};

exports.eejsBlock_editbarMenuLeft = function(hook_name, args, cb) {
    args.content = eejs.require("ep_codepad/templates/menuLeft.ejs", {toolbar: ''});
};

exports.eejsBlock_editbarMenuRight = function(hook_name, args, cb) {
    args.content = eejs.require("ep_codepad/templates/syntaxHighlightingEditbarButtons.ejs") + args.content;
};

exports.eejsBlock_mySettings_dropdowns = function(hook_name, args, cb) {
    //args.content = args.content + eejs.require("ep_codepad/templates/themesMenu.ejs");
    return cb();
};

var ext = require('ep_codepad/extensions');

exports.clientVars = function(hook, context, callback) {

    var brush = ext.getBrush(context.pad.id);
    if (!brush) brush = 'none';

    return callback({
        "theme": theme,
        "brush": brush
    });

};

