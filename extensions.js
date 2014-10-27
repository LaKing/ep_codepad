var findExtension = function(ext) {

    // Diff
    if (['diff', 'patch'].indexOf(ext) > -1) return 'diff';
    // TAP
    if (['tap', 'Tap', 'TAP'].indexOf(ext) > -1) return 'tap';
    // Scala
    if (['scala'].indexOf(ext) > -1) return 'scala';
    // Groovy
    if (['groovy'].indexOf(ext) > -1) return 'groovy';
    // Erlang
    if (['erl', 'erlang'].indexOf(ext) > -1) return 'erlang';
    // Vb
    if (['vb', 'vbnet'].indexOf(ext) > -1) return 'vb';
    // JavaFX
    if (['jfx', 'javafx'].indexOf(ext) > -1) return 'jfx';
    // CSharp
    if (['c#', 'c-sharp', 'csharp'].indexOf(ext) > -1) return 'csharp';
    // Python
    if (['py', 'python'].indexOf(ext) > -1) return 'python';
    // Php
    if (['php'].indexOf(ext) > -1) return 'php';
    // Css
    if (['css'].indexOf(ext) > -1) return 'css';
    // Haxe
    if (['haxe', 'hx'].indexOf(ext) > -1) return 'haxe';
    // TypeScript
    if (['ts', 'typescript'].indexOf(ext) > -1) return 'typescript';
    // Cpp
    if (['cpp', 'cc', 'c++', 'c', 'h', 'hpp', 'h++'].indexOf(ext) > -1) return 'cpp';
    // AppleScript
    if (['applescript'].indexOf(ext) > -1) return 'applescript';
    // AS3
    if (['actionscript3', 'as3'].indexOf(ext) > -1) return 'as3';
    // Bash
    if (['bash', 'shell', 'sh'].indexOf(ext) > -1) return 'bash';
    // Java
    if (['java'].indexOf(ext) > -1) return 'java';
    // PowerShell
    if (['powershell', 'ps', 'posh'].indexOf(ext) > -1) return 'powershell';
    // Perl
    if (['perl', 'Perl', 'pl'].indexOf(ext) > -1) return 'perl';
    // JScript
    if (['js', 'jscript', 'javascript', 'json'].indexOf(ext) > -1) return 'js';
    // Sql
    if (['sql'].indexOf(ext) > -1) return 'sql';
    // Sass
    if (['sass', 'scss'].indexOf(ext) > -1) return 'sass';
    // Delphi
    if (['delphi', 'pascal', 'pas'].indexOf(ext) > -1) return 'delphi';
    // ColdFusion
    if (['coldfusion', 'cf'].indexOf(ext) > -1) return 'coldfusion';
    // Ruby
    if (['ruby', 'rails', 'ror', 'rb'].indexOf(ext) > -1) return 'ruby';
    // Xml
    if (['xml', 'xhtml', 'xslt', 'html', 'htm', 'plist', 'ejs', 'rss', 'atom', 'xsl'].indexOf(ext) > -1) return 'xml';

    // plain text
    if (['txt', 'text', 'md', 'htaccess', 'log', 'err', 'nfo', 'bak', "coffee", "npmignore", "gitignore", "yml"].indexOf(ext) > -1) return 'plain';
    if (ext === '') return 'plain';

    return false;
};


exports.getExtension = function(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i + 1).toLowerCase();
};

exports.extensionBrush = function(ext) {
    return findExtension(ext);
};

exports.getBrush = function(filename) {
    var i = filename.lastIndexOf('.');
    var ext = (i < 0) ? 'plain' : filename.substr(i + 1).toLowerCase();
    return findExtension(ext);
};
