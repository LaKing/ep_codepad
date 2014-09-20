var padcookie = require('ep_etherpad-lite/static/js/pad_cookie').padcookie;

processLineTxt = '';

function htmlEncode(s) {
    var el = document.createElement("div");
    el.innerText = el.textContent = s;
    return el.innerHTML;
}

function htmlDecode(s) {
    var el = document.createElement('div');
    el.innerHTML = s;
    return el.firstChild.nodeValue;
}

exports.aceInitInnerdocbodyHead = function(hook_name, args, cb) {

    var brush = clientVars.brush;
    var theme = clientVars.theme;

    if (padcookie.getPref("SH_BRUSH")) brush = padcookie.getPref("SH_BRUSH");
    if (brush == 'auto') brush = clientVars.brush;

    //if (padcookie.getPref("themeName")) theme = padcookie.getPref("themeName");
    if (getCookie("codepad_theme") !== "") theme = getCookie("codepad_theme");

    // yes, a global variable on the client. Sorry about that.
    shBrush = brush;
    shTheme = theme;

    args.iframeHTML.push('<link rel="stylesheet" type="text/css" href="/static/plugins/ep_codepad/static/css/shTheme' + theme + '.css"/>');
    args.iframeHTML.push('<link rel="stylesheet" type="text/css" href="/static/plugins/ep_codepad/static/css/shHint.css"/>');

    // notify user
    var syb = document.getElementById("syntaxes");
    for (var j = 0; j < syb.options.length; j++) {
        if (brush == syb.options[j].value) syb.options[j].selected = true;
    }

    var thb = document.getElementById("themesmenu");
    for (var k = 1; k < thb.options.length; k++) {
        if (theme == thb.options[k].value) thb.options[k].selected = true;
    }

};

exports.acePostWriteDomLineHTML = function(hook_name, args, cb) {
    //try { //.. if you want to dev;

    // Called from etherpad src static js domline.js

    // stringifyed args: "{"node":{"_magicdom_dirtiness":{"nodeId":"magicdomid2","knownHTML":"<span class=\"author-a-6lydl5z83z4z78zz90zgjik5p\">LINE1</span>"}}}"
    // stringifyed args.node: "{"_magicdom_dirtiness":{"nodeId":"magicdomid2","knownHTML":"<span class=\"author-a-cz87zuz74zxz89zz87z1z89zz84zkliz70zwa\">sewd </span><span class=\"author-a-6lydl5z83z4z78zz90zgjik5p\">LINE1</span>"}}"
    // args.node.children: {"0":{},"1":{}}"
    // classname: author-###

    //console.log('args.node.children length:'+args.node.children.length);
    //console.log('aPWDLH args.node.classname:'+args.node.className);
    //console.log('aPWDLH args.node.innerHTML:'+args.node.innerHTML);

    // 
    //args.node.innerHTML='<span class="keyword">TEST</span>';
    //args.node.knownHTML='<span>Hello, Im your Span</span>';


    // if none, then nothing to do, otherwise lets start! Liny by line.
    if (typeof shBrush == 'undefined')
        return;

    if (!shBrush) return;


    if (shBrush != 'none') {
        args.node.className = "syntaxhighlighter";
    } else return;

    var children = args.node.children;
    if (typeof children === "undefined") {
        return;
    }
    if (typeof children[0] === "undefined") {
        return;
    }

    // collect the line text in this variable.
    // we need to extract the data from the authorship-color html elements - which is disabled
    // so we might have already highlighted code elements
    // rsults will be in txt
    var txt = '';

    // process each element - gereblyézés
    for (var i = 0; i < children.length; i++) {
        // etherpad might have parsed url's like http://something www.something or mailto:something
        // this might be part of the code, so we dont want to make this clickable, rather leave as it is text
        // therefore it has to be transformed back
        if (children[i].className == ' url') { // '
            // if the element is an url, etherpad has put the a href element, we substract it with string operation.
            var str = children[i].innerHTML;
            txt += str.substring(str.indexOf('>') + 1, str.length - 4);
        }
        // by default, we just need to collect the innerHTML
        else txt += children[i].innerHTML;
    }

    if (txt !== '')
        args.node.innerHTML = SyntaxHighlighter.ep_codepad_highlight({
            "brush": shBrush,
            "code": txt
        });


    // But wait a minute, maybe we have some error from jsHint we want to show 
    // so .. check for error
    if (typeof jsHintErrors != 'undefined') {

        // we have our own line-counter for this, it is reset when a message comes in.
        jsHintProcessLine++;

        // local variables
        var processLine = false;
        var processHint = '';

        var processMin = 0;
        var processMax = 0;

        // pre-calculation, check for any errors in the jsHint json
        jsHintErrors.forEach(function(err) {
            if (err) {
                // If there is any error in this line
                if (jsHintProcessLine == err.line) {

                    if (processLine === false) {
                        // this the first err 
                        processMin = err.character;
                        processMax = err.character;
                    } else {
                        // there are several errors
                        processMax = err.character;
                    }

                    processLine = true;
                    processHint += err.reason + '\n';

                    //console.info(" !: " + err.line + ":" + err.character + " " + err.reason);
                }
            }
        }); // jsHint.forEach

        // We need to  process the errors that are found
        if (processLine) {

            // our lines need to be decoded and encoded in order to know the real character numbers
            var text = htmlDecode(txt);
            // We divide the line to 3 parts. The error should be in the middle, the rest is part of the warning, can be empty too.
            var partPre = text.substring(0, processMin - 1);
            var partErr = text.substring(processMin - 1, processMax);
            var partPost = text.substring(processMax);

            args.node.innerHTML = '<span class="warn" title="' + processHint + '">' + htmlEncode(partPre) + '</span><span class="error" title="' + processHint + '">' + htmlEncode(partErr) + '</span><span class="warn" title="' + processHint + '">' + htmlEncode(partPost) + '</span>';
        }
    }


    //} catch (err) { console.log("Something BAD happened " + err); }
};

/*
    To update syntaxhighligter, ..
    download files from git
    re-add a basic modifications of ep_codepad in highlight, getHtml .. etc. in shCore.js
    remove !important marks from .css files, they are not required IMO.
    check for css files, ...
*/

exports.disableAuthorColorsForThisLine = function(hook_name, args, cb) {
    //console.log("dACFTL args.text:"+args.text + " args.class:" + args.class);

    if (typeof shBrush == 'undefined')
        return false;

    if (shBrush != 'none') return true;
    return false;
};


exports.aceKeyEvent = function(hook_name, args, cb) {

    // is syntax highlighting is on proceed, otherwise exit here...
    if (shBrush == 'none') return false;

    var browser = $.browser;
    var type = args.evt.type;
    var keyCode = args.evt.keyCode;
    var charCode = args.evt.charCode;
    //var which = args.evt.which;
    var check = "keypress";

    if ((browser.msie || browser.safari || browser.chrome)) check = "keydown";

    //console.log(args.evt.type + "evt: " + JSON.stringify(args.evt));
    //console.log(check + "?=" + type + " " + keyCode + " " + charCode + " " + which);

    // is syntax highlighting is on proceed, other wise exit here...
    if (shBrush == 'none') return false;

    // firefox:  "keydown 9 0 9"  "keypress 9 0 0"  "keyup 9 0 9"
    // chrome:  keydown 9 0 9, keyup 9 0 9 

    //if tab was pressed
    if (keyCode === 9 && charCode === 0 && type == check) {

        console.log("TAB");
        args.evt.preventDefault();
        // We should use /t for tab, but that does not work well. So, we use 4 spaces.
        args.editorInfo.ace_performDocumentReplaceRange(args.rep.selStart, args.rep.selEnd, "    ");
        args.callstack.selectionAffected = true;
        args.callstack.domClean = true;

        return true;
    }

    // firefox:  "keydown 113 0 113" "keypress 113 0 0" "keyup 113 0 113"
    // chrome: keydown 113 0 113 keyup 113 0 113 

    // if F2 was pressed, push action,..
    if (keyCode === 113 && charCode === 0 && type == check) {

        console.log("F2!");
        var message = {};
        message.type = 'WRITE_TO_FILESYSTEM';
        message.padId = pad.getPadId();
        pad.collabClient.sendMessage(message);

        return true;
    }

    return false;

};