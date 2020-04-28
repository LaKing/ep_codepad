/// padsearch variables
// padsearch linecount - use read-only outside of this file
pslc = 0;
// padsearch charactercount - use read-only outside of this file
pscc = 0;
// when searching forwards, ps cursor will be at the last character of the last match found
// when searching backwards, ps cursor will be at the first character of the last mach found

// last padsearch text
var lpsterm = '';
var lpslinetext = '';

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

function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
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
    pscc = -1;
    lpsterm = '';

    var contents = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents();
    contents.each(function() {
        // remove search highlighting
        $(this).removeClass("padsearch_line");
        $(this).find('*').removeClass("padsearch_term");
    });

};

exports.aceKeyEvent = function(hook_name, args, cb) {
    var type = args.evt.type;
    var key = args.evt.key;
    var keyCode = args.evt.keyCode;
    var charCode = args.evt.charCode;
    //var which = args.evt.which;
    var check = "keypress";
    if ((browser.msie || browser.safari || browser.chrome)) check = "keydown";

    // Search F4
    if (keyCode === 115 && charCode === 0 && type == check) {
        padsearchAction(args.editorInfo, true);
    }

    // Replace F7
    if (keyCode === 118 && charCode === 0 && type == check) {
        padsearchReplaceAction(args.editorInfo);
    }
    return false;
};

exports.postAceInit = function(hook, context) {

    // get the ace object for the button
    $('.padsearch').keypress(function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            context.ace.callWithAce(function(ace) {
                padsearchAction(ace, true);
            }, 'padsearch_callstack', true);
        }
    });
    $('.padsearch-up').click(function() {
        context.ace.callWithAce(function(ace) {
            padsearchAction(ace, false);
        }, 'padsearch_callstack', true);
    });
    $('.padsearch-down').click(function() {
        context.ace.callWithAce(function(ace) {
            padsearchAction(ace, true);
        }, 'padsearch_callstack', true);
    });
    $('.padreplace').keypress(function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            context.ace.callWithAce(function(ace) {
                padsearchReplaceAction(ace);
            }, 'padsearch_callstack', true);
        }
    });
    $('.padsearch-replace').click(function() {
        context.ace.callWithAce(function(ace) {
            padsearchReplaceAction(ace);
        }, 'padsearch_callstack', true);
    });

    // here we scroll and highlight the line if we get it on a get-parameter
    if (window.location.search !== '') {

        var params = window.location.search.replace("amp;", "");

        var line = 0;
        var char = 0;
        var tmp = [];

        // substract the linenumber info
        var items = params.substr(1).split("&");
        for (var index = 0; index < items.length; index++) {
            tmp = items[index].split("=");
            if (tmp[0] === 'line') line = Number(tmp[1]); //decodeURIComponent(tmp[1]);
            if (tmp[0] === 'char') char = Number(tmp[1]);
            //if (tmp[0] === 'amp;char') char = Number(tmp[1]);
        }

        if (line === 0) return false;

        // action!
        scrollToPadLine(line);

        // and put some highlight on it - with a delay
        setTimeout(function() {
            $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().eq(line - 1).addClass("padsearch_line");

            if (char !== 0)
                context.ace.callWithAce(function(ace) {
                    // Set the caret position
                    ace.ace_performSelectionChange([line - 1, char], [line - 1, char], false);
                }, 'padsearch_callstack', true);

        }, 1000);
    }

};

// This function returns false if some pre-condition fails for the replace action
function padsearchReplacepreCheck(ace) {

    var ps = pse.value;
    var pr = pre.value;

    // searchterm changed! TODO eventually it got extended or cropped, .. but we reposition cursor for now
    if (ps !== lpsterm) {
        $('#status').html("Serchterm changed");
        padSearchReset();
        padsearchAction(ace, true);
        return false;
    }
    lpsterm = ps;

    // user input check
    // check for fille input fields - TODO import from selection if empty
    if (ps === '') {
        $('#status').html("No Searchterm");
        return false;
    }

    // check for equality of terms
    if (ps === pr) {
        padsearchAction(ace, true);
        return false;
    }


    // codepad cursor validity check
    // make sure we are on a valid line with our padsearch linecount cursor

    if (pslc < 1 || pscc < 0) {
        padsearchAction(ace, true);
        return false;
    }

    var line_obj = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().eq(pslc - 1);

    // Content change check
    if (line_obj.text() !== lpslinetext) {
        $('#status').html("Line content changed.");
        pscc = 0;
        padsearchAction(ace, true);
        return false;
    }

    // we can assume the replace can take place ...

    return true;
}


function padsearchReplaceAction(ace) {

    if (!padsearchReplacepreCheck(ace)) return false;

    ace.ace_replaceRange([pslc - 1, pscc], [pslc - 1, pscc + pse.value.length], pre.value);

    // the line lenght propably changed
    lpslinetext = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().eq(pslc - 1).text();
    padsearchAction(ace, true);

    var message = {};
    message.type = 'EDIT';
    message.padId = pad.getPadId();
    message.userId = pad.getUserId();
    message.line = pslc;
    pad.collabClient.sendMessage(message);

}

exports.documentReady = function() {

    // import values from main codepad search - if they are set
    // TODO CAKE NEED TO SUPPORT THIS!
    //pse.value = decodeURIComponent(getCookie("codepad_search"));
    //pre.value = decodeURIComponent(getCookie("codepad_replace"));

};

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

// Keys are: Search-enter Replace-enter Up-button Down-button Action-button F4 F7 -> U, D
padsearchAction = function(ace, fw) {

    // if there is no searchterm given, check for selected text!
    var rep = ace.ace_getRep();
    if (pse.value === '' && rep.selStart[0] === rep.selEnd[0] && rep.selStart[1] !== rep.selEnd[1]) {
        pse.value = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().eq(rep.selStart[0]).text().substring(rep.selStart[1], rep.selEnd[1]);
    }

    // get search and replace terms
    var ps = pse.value;
    var pr = pre.value;

    // searchterm changed! TODO eventually it got extended or cropped, .. but we reposition cursor for now
    if (ps !== lpsterm) padSearchReset();
    lpsterm = ps;


    // no padsearchterm
    if (ps === '') {
        $('#status').html("No searchterm!");
        padSearchReset();
        return false;
    }

    var contents = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents();
    if (!fw) contents = $(contents.get().reverse());

    // as jQuery iterates through the lines, we count them in here.
    var count = 1;
    if (!fw) count = contents.length;

    // padsearch machcount
    var psmc = 0;

    // we process the line text - not the html code
    var lineText = '';

    // find-index
    var findex = -1;

    // get the total
    var total = count_in_str(ps, contents.text());

    // determine if cursor is at a valid position
    if (total < 1) {
        $('#status').html("0/0");
        padSearchReset();
        return false;
    }

    /*
    // if the search direction changed, reposition the ps cursor
    if (lpsfw != fw) {
        // from forward to backward
        if (!fw && pscc >= ps.length) pscc -= ps.length;
        // from backward to forward
        if (fw && pscc >= 0) pscc += ps.length;
    }
*/

    // iterate thru each line
    contents.each(function() {

        // seek forward or seek backward
        if ((fw && count >= pslc) || ((!fw) && count <= pslc)) {

            lineText = $(this).text();
            lineHtml = $(this).html();

            // update cursor positions
            pslc = count;
            console.log("LINE " + count + " &" + pscc + " #" + lineText);
            //console.log("LINE " + count + " #" + lineText);

            if (fw) {
                pscc++;
                findex = lineText.substr(pscc).indexOf(ps);
            } else {
                if (pscc == -1) pscc = lineText.length;

                findex = lineText.substr(0, (pscc + ps.length - 1)).lastIndexOf(ps);
            }

            //if (fw) findex = lineText.substr(pscc).indexOf(ps);
            //else findex = lineText.substr(0, pscc).lastIndexOf(ps);

            // if found a match
            if (findex >= 0) {

                console.log("findex " + findex);

                // set character-index
                if (fw) pscc += findex;
                else pscc = findex;

                // visualize line
                scrollToPadLine(count);
                $(this).addClass("padsearch_line");

                lpslinetext = lineText;

                // determine current hit and do a status report
                $('#status').html(getCurrentMachcount() + "/" + total + " @ " + pslc + ":" + pscc);

                ace.ace_performSelectionChange([pslc - 1, pscc], [pslc - 1, pscc + ps.length]);

                //if (fw)
                //pscc++;

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
                    //$('#status').html
                    //alert('End of file reached.');
                    pslc = 0;
                    pscc = -1;
                    padsearchAction(ace, true);

                    //padSearchReset();
                }
                // little bug here, this is never reached, it toggles between maches on the first line
                if (!fw && pslc == 1) {
                    //$('#status').html
                    //alert('Beginning of file reached.');
                    pslc = contents.length;
                    pscc = -1;
                    padsearchAction(ace, false);
                    //padSearchReset();
                }
            }
            console.log("@ " + pslc + " & " + pscc);

        }

        // part of the iteration
        if (fw) count++;
        else count--;

        // end of each
    });

    // end of padSearchFunction
};



exports.aceCreateDomLine = function(name, context) {
    /*    var cls = context.cls;

    console.log("@ aceCreateDomLine " + JSON.stringify(cls) + " " + JSON.stringify(domline));
    var modifier = {
        extraOpenTags: '<span class="padsearch_term">',
        extraCloseTags: '</span>',
        cls: cls
    };
    return [modifier];*/
};
