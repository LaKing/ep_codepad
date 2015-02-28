// functionality is dependent on modified highlihting. Last update 24.02.2015.
// src/higlight.js and languages/javascript.js
// each { and } needs to be a standalone html-tag.

var padeditor = require('ep_etherpad-lite/static/js/pad_editor').padeditor;
//var hl_stack = '';


exports.aceEditEvent = function(hook_name, args, cb) {
    //    try {

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

    if (typeof args.callstack.observedSelection === 'undefined') {

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