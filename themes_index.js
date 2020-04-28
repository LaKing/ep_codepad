var eejs = require('ep_etherpad-lite/node/eejs');
var settings = require('ep_etherpad-lite/node/utils/Settings');

var ext = require('ep_codepad/extensions');

exports.eejsBlock_scripts = function(hook_name, args, cb) {
    //args.content = args.content + eejs.require("ep_codepad/templates/syntaxHighlightingScripts.ejs");

    args.content += '<script src="../static/plugins/ep_codepad/static/js/highlight.codepad.js"></script>';

    return cb();
};

exports.eejsBlock_styles = function(hook_name, args, cb) {
    var res_send = '';
    args.content = args.content + res_send;
    return cb();

};

exports.eejsBlock_timesliderStyles = function(hook_name, args, cb) {
    var res_send = '';
    args.content = args.content + res_send;
    return cb();
};

exports.eejsBlock_editbarMenuLeft = function(hook_name, args, cb) {
    args.content = eejs.require("ep_codepad/templates/menuLeft.ejs", {
        toolbar: ''
    });
};

exports.eejsBlock_editbarMenuRight = function(hook_name, args, cb) {
    args.content = eejs.require("ep_codepad/templates/syntaxHighlightingEditbarButtons.ejs") + args.content;
};

exports.eejsBlock_mySettings_dropdowns = function(hook_name, args, cb) {
    //args.content = args.content + eejs.require("ep_codepad/templates/themesMenu.ejs");
    return cb();
};


exports.clientVars = function(hook, context, callback) {

    var brush = ext.getBrush(context.pad.id);
    if (!brush) brush = 'none';

    var rundef = {};

    if (settings.ep_codepad_run) rundef = settings.ep_codepad_run;

    return callback({
        "brush": brush,
        "rundef": rundef
    });

};
