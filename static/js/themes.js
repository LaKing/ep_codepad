// aceTheme
exports.aceEditorCSS = function(hook_name, cb) { // inner pad CSS;
    var theme = clientVars.theme;
    if (getCookie("codepad_theme") !== '') theme = getCookie("codepad_theme");
    return ['ep_codepad/static/css/theme/' + theme + '.css'];
};

// THEME
exports.aceInitInnerdocbodyHead = function(hook_name, args, cb) {

    var theme = 'none';
    if (typeof clientVars.theme !== 'undefined') theme = clientVars.theme;

    //if (getCookie("codepad_theme") !== "") theme = getCookie("codepad_theme");

    // yes, a global variable on the client. Sorry about that.
    shTheme = theme;

    // TODO - check if this is relevant here - actually I noticed that on a new install the default theme selection is ignored
    args.iframeHTML.push('<link rel ="stylesheet" type="text/css" href="/static/plugins/ep_codepad/static/css/theme/' + theme + '.css"/>');

};