exports.aceEditorCSS = function(hook_name, cb) { // inner pad CSS;

    //var padcookie = require('ep_etherpad-lite/static/js/pad_cookie').padcookie;
    var theme = clientVars.theme;
    if (getCookie("codepad_theme") !== '') theme = getCookie("codepad_theme");
    //if (padcookie.getPref('themeName')) theme = padcookie.getPref('themeName');
    return ['ep_codepad/static/css/theme/' + theme + '.css'];
};
