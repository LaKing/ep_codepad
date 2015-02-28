/// padsearch variables

// padsearch linecount - use read-only outside of this file
pslc = 0;
// padsearch charactercount - use read-only outside of this file
pscc = 0;
// when searching forwards, ps cursor will be at the last character of the last match found
// when searching backwards, ps cursor will be at the first character of the last mach found

// last padsearch text
var lpstext = '';
// last padsearch direction, true for forward
var lpsfw = true;

// padsearch elements
var pse = document.getElementById("padsearch");
var pre = document.getElementById("padreplace");

// helper function, count all occurences of a substring in a string
function count_in_str(substring, string) {
    var cnt = 0;
    var pos = 0;

    while (true) {
        pos = string.indexOf(substring, pos);
        if (pos != -1) {
            cnt++;
            pos += substring.length;
        } else {
            break;
        }
    }
    return (cnt);
}

// scrolltoPadLine is used in static message.js, and in padsearch - for now defined twice
// https://github.com/JohnMcLear/ep_scrollto/blob/master/static/js/postAceInit.js
function scrollToPadLine(lineNumber) {

    var count = 1;
    if (lineNumber > 10) lineNumber = lineNumber - 10;
    else lineNumber = 1;

    $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().each(function() {
        if (count == lineNumber) {
            var newY = $(this).context.offsetTop + "px";
            var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");
            var $outerdocHTML = $('iframe[name="ace_outer"]').contents().find("#outerdocbody").parent();
            $outerdoc.animate({
                scrollTop: newY
            });

            // browser.mozilla is obsolete
            if (browser.mozilla || browser.firefox) $outerdocHTML.animate({
                scrollTop: newY
            }); // needed for FF     
            return false;
        }
        count++;
    });
}

var padSearchReset = function() {
    pslc = 0;
    pscc = 0;
    lpstext = '';
    lpsfw = true;

};


exports.postAceInit = function(hook, context) {

    // This is how I get the context for the button
    $('.padsearch-replace').click(function() {
        padsearchReplaceAction(context);
    });

    // here we scroll and highlight to the line if we get it on a get parameter    
    if (window.location.search !== '') {

        var line = 0;
        var tmp = [];

        // substract the linenumber info
        var items = location.search.substr(1).split("&");
        for (var index = 0; index < items.length; index++) {
            tmp = items[index].split("=");
            if (tmp[0] === 'line') line = Number(tmp[1]); //decodeURIComponent(tmp[1]);
        }

        if (line === 0) return false;

        // action!
        scrollToPadLine(line);

        // and put some highlight on it - with a delay
        setTimeout(function() {

            var count = 1;
            var contents = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents();

            // need to find it through the lines
            contents.each(function() {
                if (line == count) {
                    $(this).addClass("padsearch_line");
                    return false;
                }
                count++;
            });

        }, 1000);
    }

};

// This function returns false if some pre-condition fails for the replace action
function padsearchReplacepreCheck() {

    var ps = pse.value;
    var pr = pre.value;

    // user input check
    // check for fille input fields - TODO import from selection if empty
    if (ps === '') {
        $('#status').html("No Searchterm");
        return false;
    }
    // TODO: actually we should allow replacing to ''
    if (pr === '') {
        $('#status').html("No replace-term");
        return false;
    }

    // check for equality of terms
    if (ps === pr) {
        padSearchAction("D");
        return false;
    }

    // codepad cursor validity check
    // make sure we are on a valid line with our padsearch linecount cursor

    if (pslc < 1 || pscc < 0) {
        padSearchAction("D");
        return false;
    }
    if (pslc < 1 || pscc < 0) return false;

    // we can assume the replace will take place ...

    // if the last action was backward, the cursor needs to be repositioned
    if (!lpsfw) {
        pscc -= pse.value.length;
    }


    return true;
}

function padsearchReplaceAction(context) {

    if (!padsearchReplacepreCheck()) return false;

    // perform replace via button
    context.ace.callWithAce(function(ace) {
        ace.ace_performDocumentReplaceRange([pslc - 1, pscc - pse.value.length], [pslc - 1, pscc], pre.value);
    }, 'padsearch_callstack', true);

    padSearchAction("D");
}

exports.aceKeyEvent = function(hook_name, args, cb) {

    // if syntax highlighting is on proceed, otherwise exit here... 
    // TODO check if this is necessery in here, eg search and replace for non-code?
    if (shBrush == 'none') return false;

    var type = args.evt.type;
    var key = args.evt.key;
    var keyCode = args.evt.keyCode;
    var charCode = args.evt.charCode;

    //var which = args.evt.which;
    var check = "keypress";

    if ((browser.msie || browser.safari || browser.chrome)) check = "keydown";


    // Search F4
    if (keyCode === 115 && charCode === 0 && type == check) padSearchAction("D");

    // Replace F7
    if (keyCode === 118 && charCode === 0 && type == check) {

        if (!padsearchReplacepreCheck()) return false;

        // perform replace via F7
        args.editorInfo.ace_performDocumentReplaceRange([pslc - 1, pscc - pse.value.length], [pslc - 1, pscc], pre.value);

        padSearchAction("D");

    }
    return false;

};

// the main search function will be exposed here
exports.documentReady = function() {

    // import values from main codepad search - if they are set
    pse.value = decodeURIComponent(getCookie("codepad_search"));
    pre.value = decodeURIComponent(getCookie("codepad_replace"));


    getCurrentMachcount = function() {
        // look only forward, count all occurences till the cursor position
        var ps = pse.value;
        var contents = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents();
        var lineCount = 1;
        var lineText = '';
        var psmc = 1;
        contents.each(function() {
            lineText = $(this).text();
            if (lineCount > pslc) return false;
            if (lineCount < pslc) psmc += count_in_str(ps, lineText);
            if (lineCount == pslc) psmc += count_in_str(ps, lineText.substring(0, pscc));
            lineCount++;
        });
        return psmc;
    };

    // Keys are: Search-enter Replace-enter Up-button Down-button Action-button
    padSearchAction = function(Key) {

        // get search and replace terms
        var ps = pse.value;
        var pr = pre.value;

        var fw = true;
        if (Key == 'U') fw = false;

        // searchterm changed! TODO eventually it got extended or cropped, .. but we reposition cursor for now
        if (ps !== lpstext) padSearchReset();
        lpstext = ps;

        // TODO if there is no searchterm given, check for selected text!

        // no padsearchterm
        if (ps === '') {
            $('#status').html("No searchterm!");
            return false;
        }

        // as jQuery iterates through the lines, we count them in here.
        var count = 1;

        // padsearch machcount
        var psmc = 0;

        // we process the line text - not the html code
        var lineText = '';

        // find-index
        var findex = -1;

        var contents = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents();

        // get the total
        var total = count_in_str(ps, contents.text());

        // determine if cursor is at a valid position

        if (total < 1) {
            $('#status').html("0/0");
            return false;
        }

        if (!fw) contents = $(contents.get().reverse());
        if (!fw) count = contents.length;

        // if the search direction changed, reposition the ps cursor
        if (lpsfw != fw) {
            // from forward to backward
            if (!fw && pscc >= ps.length) pscc -= ps.length;
            // from backward to forward
            if (fw && pscc >= 0) pscc += ps.length;
        }

        // iterate thru each line
        contents.each(function() {

            // seek forward or seek backward
            if ((fw && count >= pslc) || ((!fw) && count <= pslc)) {

                lineText = $(this).text();

                // update cursor positions
                pslc = count;

                if (pscc == -1) {
                    if (fw) pscc = 0;
                    else pscc = lineText.length;
                }

                if (fw) findex = lineText.substr(pscc).indexOf(ps);
                else findex = lineText.substr(0, pscc).lastIndexOf(ps);

                // if found a match
                if (findex >= 0) {


                    if (fw) pscc += findex;
                    else pscc = findex;

                    // set last padsearch direction to the actual direction, as padsearch cursor is repositioned
                    lpsfw = fw;

                    // visualize line
                    scrollToPadLine(count);

                    // line visualization
                    $(this).addClass("padsearch_line");

                    // word visualisation - simple reformatted text -- BIG TODO here !!
                    var newtext = lineText.substring(0, pscc) + '<span class="padsearch_term">' + ps + '</span>' + lineText.substring(pscc + ps.length);

                    // Apply the new higlighting - BIG TODO - no idea yet how to restore
                    $(this).html('<!-- padsearch-highlighted -->' + newtext);

                    // determine current and do a status report
                    $('#status').html(getCurrentMachcount() + "/" + total + " @ " + pslc + ":" + pscc);

                    if (fw) pscc += ps.length;

                    return false;

                } else {
                    //next line

                    // set character counter to unknown
                    pscc = -1;

                    // remove search highlighting
                    $(this).removeClass("padsearch_line");
                    $(this).find('*').removeClass("padsearch_term");

                    // IMO circular behaviour is not desired, so note user of end of search.
                    if (fw && pslc == contents.length) {
                        $('#status').html('End of file reached.');
                        padSearchReset();
                    }
                    // little bug here, this is never reached, it toggles between maches on the first line
                    if (!fw && pslc <= 1) {
                        $('#status').html('Beginning of file reached.');

                        padSearchReset();
                    }
                }

            }

            // part of the iteration
            if (fw) count++;
            else count--;

            // end of each
        });

        // end of padSearchFunction
    };

    return;
};