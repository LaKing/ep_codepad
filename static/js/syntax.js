var padcookie = require('ep_etherpad-lite/static/js/pad_cookie').padcookie;
var hl_stack = '';
// SYNTAX
exports.aceInitInnerdocbodyHead = function(hook_name, args, cb) {

    var brush = 'none';
    if (typeof clientVars.brush !== 'undefined') brush = clientVars.brush;

    if (padcookie.getPref("SH_BRUSH")) brush = padcookie.getPref("SH_BRUSH");
    if (brush == 'auto') brush = clientVars.brush;

    // yes, a global variable on the client. Sorry about that.
    shBrush = brush;

    // notify user
    var syb = document.getElementById("syntaxes");
    for (var j = 0; j < syb.options.length; j++) {
        if (brush == syb.options[j].value) syb.options[j].selected = true;
    }
};

exports.acePostWriteDomLineHTML = function(hook_name, args, cb) {
    //try { //.. if you want to dev;

    //console.log("args " + JSON.stringify(args) + " text " + JSON.stringify(args.node.innerHTML));

    //var contents = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents();
    //contents.each(function() {
    //    console.log("::?");

    //});


    // if none, then nothing to do, otherwise lets start! Liny by line.
    if (typeof shBrush == 'undefined')
        return;

    if (!shBrush) return;


    if (shBrush == 'none' || shBrush == 'plain') return;

    var children = args.node.children;
    if (typeof children === "undefined") {
        return;
    }
    if (typeof children[0] === "undefined") {
        return;
    }

    var txt = args.node.textContent;

    if (txt !== '') { //&& JSON.stringify(args.node) == "{}") {

        var hl = hljs.highlight(shBrush, args.node.textContent, true, hl_stack);
        args.node.innerHTML = hl.value;
        if (hl.top) hl_stack = hl.top;
        // highlighting is a bit bugged. Needs investigation, ..
        //console.log("syntax hl_stack: " + JSON.stringify(hl_stack).substring(0, 2) + " " + txt.substring(0, 10) + " args.node: " + JSON.stringify(args.node).substring(0, 10));
    }

    //} catch (err) {
    //    console.log("syntax.js: Something MISARABLE happened " + err);
    //}
};


exports.disableAuthorColorsForThisLine = function(hook_name, args, cb) {
    // console.log("dACFTL args.text:" + args.text + " args.class:" + args.class);

    if (typeof shBrush == 'undefined')
        return false;

    if (shBrush != 'none') return true;
    return false;
};

exports.aceKeyEvent = function(hook_name, args, cb) {
    // only if syntax highlighting is on
    if (shBrush == 'none' || shBrush == 'plain') return false;
    // ignore irrelevant Edit Events
    if (args.callstack.type !== 'handleKeyEvent') return; // idleWorkTimer // handleClick

    // prepare variables
    var rep = args.rep;
    var editorInfo = args.editorInfo;
    var cl = editorInfo.ace_caretLine();
    //var cc = editorInfo.ace_caretColumn();
    var lines = rep.alltext.split('\n');

    var prep = lines.slice(0, cl);
    var preps = prep.join('\n');
    // The highlighting stack has to be re-calculated for this line
    // so at least this line is highlighted correctly. (previous and next lines do not get re-parsed)
    var hl = hljs.highlight(shBrush, preps, true);
    if (hl.top) {
        hl_stack = hl.top;
        //console.log("tracebraces stack:" + JSON.stringify(hl_stack).substring(0, 10));
    } else {
        hl_stack = '';
        //console.log("tracebraces hl_stack reset");
    }
};