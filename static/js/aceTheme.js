exports.aceEditorCSS = function(hook_name, cb) { // inner pad CSS;
    var theme = clientVars.theme;
    if (getCookie("codepad_theme") !== '') theme = getCookie("codepad_theme");
    return ['ep_codepad/static/css/theme/' + theme + '.css'];
};