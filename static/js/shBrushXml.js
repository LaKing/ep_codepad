/**
 * SyntaxHighlighter
 * http://alexgorbatchev.com/SyntaxHighlighter
 *
 * SyntaxHighlighter is donationware. If you are using it, please donate.
 * http://alexgorbatchev.com/SyntaxHighlighter/donate.html
 *
 * @version
 * 3.0.9 (Fri, 15 Aug 2014 23:04:52 GMT)
 *
 * @copyright
 * Copyright (C) 2004-2013 Alex Gorbatchev.
 *
 * @license
 * Dual licensed under the MIT and GPL licenses.
 */

(function() {
    // CommonJS
    SyntaxHighlighter = SyntaxHighlighter || (typeof require !== 'undefined' ? require('shCore').SyntaxHighlighter : null);

    function Brush() {
        function process(match, regexInfo) {
            var constructor = SyntaxHighlighter.Match,
                code = match[0],
                //tag = XRegExp.exec(code, XRegExp('(&lt;|<)[\\s\\/\\?!]*(?<name>[:\\w-\\.]+)', 'xg')),
                // TODO bug! <t> turns to something weird!
                // azért cseréli le a <t> mert túl rövid....
                //(&lt;|<)*(?<name>[\\s\\S]+$)
                //  .. ez most így mindent 2 szín?vé tesz
                //valamiért a t már nem jut el a második forduláshoz
                //Array [ "&lt;t", "&lt;", "t" ]
                tag = XRegExp.exec(code, XRegExp('(&lt;|<)[\\s\\/\\?!]*(?<name>[:\\w-\\.]+)', 'sg')),
                result = [];
                console.log(tag);

            if (match.attributes !== null) {
                var attributes,
                    pos = 0,
                    regex = XRegExp('(?<name> [\\w:.-]+)\\s*=\\s*(?<value> ".*?"|\'.*?\'|\\w+)', 'xg');

                while ((attributes = XRegExp.exec(code, regex, pos)) !== null) {
                    result.push(new constructor(attributes.name, match.index + attributes.index, 'color1'));
                    result.push(new constructor(attributes.value, match.index + attributes.index + attributes[0].indexOf(attributes.value), 'string'));
                    pos = attributes.index + attributes[0].length;
                }
            }
            //itt történik meg a kiiratás
            if (tag !== null)
                result.push(
                    new constructor(tag.name, match.index + tag[0].indexOf(tag.name), 'keyword')
                );
                    
            return result;
        }

        this.regexList = [{
                regex: XRegExp('(\\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\\&gt;|>)', 'gm'),
                css: 'color2'
            }, // <![ ... [ ... ]]>
            {
                regex: SyntaxHighlighter.regexLib.xmlComments,
                css: 'comments'
            }, // <!-- ... -->
            {

                regex: XRegExp('(?:&lt;|<)[\\s\\/\\?!]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)', 'sg'),
                func: process
                //(&lt;|<)[\\s\\/\\?!]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)
                //valószín? itt d?l el, hogy mi legyen kijelölve és mi ne.
                //Er?s hátrány, hogy különbség van regExp és XregExp között... Így nem minden megoldás m?ködik.
                //De rajta vagyok a problémán... :)
            }
        ];
    };

    Brush.prototype = new SyntaxHighlighter.Highlighter();
    Brush.aliases = ['xml', 'xhtml', 'xslt', 'html', 'plist'];

    SyntaxHighlighter.brushes.Xml = Brush;

    // CommonJS
    typeof(exports) != 'undefined' ? exports.Brush = Brush : null;
})();
