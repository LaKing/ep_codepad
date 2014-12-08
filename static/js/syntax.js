// syntax

var padcookie = require('ep_etherpad-lite/static/js/pad_cookie').padcookie;

var hl_stack = '';


exports.aceInitInnerdocbodyHead = function(hook_name, args, cb) {

    var brush = 'none';
    var theme = 'none';

    if (typeof clientVars.brush !== 'undefined') brush = clientVars.brush;
    if (typeof clientVars.theme !== 'undefined') theme = clientVars.theme;

    if (padcookie.getPref("SH_BRUSH")) brush = padcookie.getPref("SH_BRUSH");
    if (brush == 'auto') brush = clientVars.brush;

    if (getCookie("codepad_theme") !== "") theme = getCookie("codepad_theme");

    // yes, a global variable on the client. Sorry about that.
    shBrush = brush;
    shTheme = theme;

    // TODO - check if this is relevant here - actually I noticed that on a new install the default theme selection is ignored
    args.iframeHTML.push('<link rel ="stylesheet" type="text/css" href="/static/plugins/ep_codepad/static/css/theme/' + theme + '.css"/>');

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

    if (txt !== '') {
        var hl = hljs.highlight(shBrush, args.node.textContent, true, hl_stack);
        args.node.innerHTML = hl.value;
        if (hl.top) hl_stack = hl.top;
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

    // is syntax highlighting is on proceed, otherwise exit here...
    if (shBrush == 'none') return false;

    var browser = $.browser;
    var type = args.evt.type;
    var keyCode = args.evt.keyCode;
    var charCode = args.evt.charCode;

    //var which = args.evt.which;
    var check = "keypress";

    if ((browser.msie || browser.safari || browser.chrome)) check = "keydown";

    // firefox:  "keydown 9 0 9"  "keypress 9 0 0"  "keyup 9 0 9"
    // chrome:  keydown 9 0 9, keyup 9 0 9 

    //if tab was pressed 
    if (keyCode === 9 && charCode === 0 && type == check) {

        args.evt.preventDefault();
        // We should use /t for tab, but that does not work well. So, we use 4 spaces.
        args.editorInfo.ace_performDocumentReplaceRange(args.rep.selStart, args.rep.selEnd, "    ");
        args.callstack.selectionAffected = true;
        args.callstack.domClean = true;

        return true;
    }

    // firefox:  "keydown 113 0 113" "keypress 113 0 0" "keyup 113 0 113"
    // chrome: keydown 113 0 113 keyup 113 0 113 

    // if F2 was pressed
    if (keyCode === 113 && charCode === 0 && type == check) {
        //console.log("F2-Event @ " + args.editorInfo.ace_caretLine() + ":" + args.editorInfo.ace_caretColumn() + ":" + args.editorInfo.ace_caretDocChar());

        var message = {};
        message.type = 'WRITE_TO_FILESYSTEM';
        message.padId = pad.getPadId();
        pad.collabClient.sendMessage(message);

        return true;
    }

    return false;

};

var padeditor = require('ep_etherpad-lite/static/js/pad_editor').padeditor;
exports.aceEditEvent = function(hook_name, args, cb) {
    //    try {

    // only if syntax highlighting is on
    if (shBrush == 'none') return false;
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

    if (typeof args.callstack.observedSelection !== 'undefined') {
        //console.log("SET STACK");
        // The highlighting stack has to be re-calculated for this line
        // so at least this line is highlighted correctly. (previous and next lines do not get re-parsed)
        var hl = hljs.highlight(shBrush, preps, true);
        if (hl.top) hl_stack = hl.top;
        else hl_stack = '';
    } else {

        // Trace Curly Braces
        if (shBrush === 'js')
        // this delay is necessery to get the really CURRENT current-caret-position, after the edit, and not the previous state.
            setTimeout(function() {
            // Current caret line and Curent caret character
            var Ccl = editorInfo.ace_caretLine();
            var Ccc = editorInfo.ace_caretColumn();
            var next = lines[Ccl].charAt(Ccc);
            var prev = lines[Ccl].charAt(Ccc - 1);

            var idb = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody');

            // this is the etherpad line number.
            var line_offset = Ccl + 1;


            // the html tag (only the opening part) from hljs
            // starting html tag
            var htags = '<span class="hljs-cb">';
            // closing tag
            var htage = '</span>';

            var O = '{';
            var C = '}';
            // Curly Bracket
            //if (prev === '{' || next === '{' || prev === '}' || next === '}' ) {

            if (prev === O || prev === C || next === O || next === C) {

                // find direction forward
                var f = true;

                // if next is empty, step back
                if (next !== O && next !== C) {
                    Ccc--;
                    if (prev === C) f = false;
                } else
                if (next === C) f = false;

                // limit line iterations
                var line_limiter = 100;

                // clear
                idb.find("*").removeClass('active');
                idb.find("*").removeClass('missing');

                // true if found opening or closing
                // equivalent-to eqo>=0 and eqc>=0 
                var iso = false;
                var isc = false;
                // magicdom div of current line
                var div;
                // html of current line
                var html;
                var line;
                // html split array       
                var hsa;
                // line split array 
                var lsa;
                // list of spans containing jquery objects
                var spans;
                var cbo_spans;
                var cbc_spans;
                // eq index
                var eqi = -1;
                var eqo = -1;
                var eqc = -1;
                // line number notification message
                var lnnm = '';
                // i will be the index of the processed block in the current line
                var i;
                // current processing character position
                var pos;
                // middle calculation
                var mid = 0;

                // typ, the valid tag eg { or }
                var typ;

                var hre = new RegExp("(" + htags + O + htage + "|" + htags + C + htage + "|" + O + "|" + C + ")", "g");
                var lre = new RegExp("(" + O + "|" + C + ")", "g");

                // loop on lines
                while ((0 < line_offset) && (line_offset < lines.length)) {

                    div = idb.find("div:nth-child(" + line_offset + ")");
                    html = div.html();
                    line = lines[line_offset - 1];

                    // list of spans containing cb's.
                    spans = div.find("span[class='hljs-cb']");
                    if (!iso) cbo_spans = spans;
                    if (!isc) cbc_spans = spans;

                    // eq index
                    eqi = -1;
                    if (!f) eqi = spans.length;

                    // hsa and lsa have the same indexing
                    hsa = html.split(hre);
                    lsa = line.split(lre);


                    if (f) pp = 0;
                    if (!f) pp = line.length + 1;

                    if (f) i = 0;
                    if (!f) i = lsa.length - 1;

                    // loop on this line, only if it was split, that means has cb character
                    if (1 < lsa.length)
                        while (0 <= i && i < lsa.length) {

                            // is this a valid tag that needs to be counted in?
                            if ((lsa[i] === O && (hsa[i] === (htags + O + htage))) || (lsa[i] === C && (hsa[i] === (htags + C + htage)))) {

                                // increment eq index if this is a valid tag.
                                if (f) eqi++;
                                if (!f) eqi--;

                                if (f && iso && !isc && lsa[i] === C && mid === 0) {
                                    lnnm = line_offset;
                                    eqc = eqi;
                                    isc = true;
                                    break;
                                }

                                if (!f && !iso && isc && lsa[i] === O && mid === 0) {
                                    lnnm = line_offset;
                                    eqo = eqi;
                                    iso = true;
                                    break;
                                }

                                if (lsa[i] === O) mid++;
                                if (lsa[i] === C) mid--;

                                // if this is the first line
                                if (line_offset === Ccl + 1) {
                                    if (f) pos = lsa.slice(0, i).join('').length;
                                    if (!f) pos = line.length - lsa.slice(i, lsa.length).join('').length;
                                    if (pos === Ccc) {
                                        // @ Caret position, 
                                        if (lsa[i] === O) {
                                            eqo = eqi;
                                            iso = true;
                                        }
                                        if (lsa[i] === C) {
                                            eqc = eqi;
                                            isc = true;
                                        }
                                        // start counting of middle elements
                                        mid = 0;
                                    }
                                }
                            }

                            // iterate block
                            if (f) i++;
                            if (!f) i--;

                        }

                    if (iso && isc) break;

                    // iterate line
                    if (f) line_offset++;
                    if (!f) line_offset--;
                    line_limiter--;
                    if (line_limiter <= 0) {
                        console.log("[trace curly braces] pair is more then 100 lines away.");
                        return false;
                    }
                }

                if (iso)
                    if (isc) cbo_spans.eq(eqo).addClass("active");
                    else cbo_spans.eq(eqo).addClass("missing");

                if (isc)
                    if (iso) cbc_spans.eq(eqc).addClass("active");
                    else cbc_spans.eq(eqc).addClass("missing");

                if (iso || isc)
                    if (line_limiter < 80) console.log("[trace curly braces] pair @ line:" + lnnm);
                setTimeout(function() {
                    // clear
                    cbo_spans.eq(eqo).removeClass('active');
                    cbo_spans.eq(eqo).removeClass('missing');
                    cbc_spans.eq(eqc).removeClass('active');
                    cbc_spans.eq(eqc).removeClass('missing');
                }, 1000);
            } // if prev
        }, 10);
    }
    return false;

    //    } catch (e) {
    //        if (e) throw e;
    //    }

};