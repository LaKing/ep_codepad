exports.aceKeyEvent = function(hook_name, args, cb) {

    // is syntax highlighting is on proceed, otherwise exit here...
    if (shBrush == 'none') return false;

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

    ///////// experimenting here - how to set caret to a position ??????
    if (keyCode === 120 && charCode === 0 && type == check) {

        line = args.editorInfo.ace_caretLine();
        char = args.editorInfo.ace_caretColumn();

        var rep = args.editorInfo.ace_getRep();
        rep.selStart = [10, 10];
        rep.selEnd = [10, 11];
        rep.selFocusAtStart = true;


        console.log("F9 keypress @ " + line + ':' + char + ' rep: ' + JSON.stringify(rep));

        //args.editorInfo.ace_performSelectionChange([10, 10], [10, 10], true);

        //args.editorInfo.ace_setProperty('caretLine', 10);
        //args.editorInfo.ace_callWithAce(function(ace) {
        //    console.log('callwithace');
        //    ace.ace_performSelectionChange([10, 10], [10, 11]);
        //});

    }
    //////////

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