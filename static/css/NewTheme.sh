#!/bin/bash

## This script should help you to build new themes.

name="New"

## Some parameters have to be re-set here - be careful with the values, this scipt is not idiot-proof.
## make sure you get valid color codes.
## By default, we generate darker themes.

## TODO with the syntax-highlighting css files, it seems there are unnecessery dublicates in it.

## start color - the brightest
rs=220
gs=250
bs=230

## divider : 1 - no fade 2 - normal fade - 3 - crazy
d=3

#step - min 17 - max ~100
ra=22
ga=56
ba=32

## random range
rr=70
gr=30
br=70

BKG=$(echo "obase=16; $ra"|bc)$(echo "obase=16; $ga"|bc)$(echo "obase=16; $ba"|bc)


## random color generator
function rc {
echo $(echo "obase=16; $(($rs-RANDOM%$rr))"|bc)$(echo "obase=16; $(($gs-RANDOM%$gr))"|bc)$(echo "obase=16; $(($bs-RANDOM%$br))"|bc)
#'"
}

echo 'random color sample:'
rc
rc
rc

r=$rs
g=$gs
b=$bs

colorA=$(echo "obase=16; $r"|bc)$(echo "obase=16; $g"|bc)$(echo "obase=16; $b"|bc)
let "r = r / d + ra"
let "g = g / d + ga"
let "b = b / d + ba"
colorB=$(echo "obase=16; $r"|bc)$(echo "obase=16; $g"|bc)$(echo "obase=16; $b"|bc)
let "r = r / d + ra"
let "g = g / d + ga"
let "b = b / d + ba"
colorC=$(echo "obase=16; $r"|bc)$(echo "obase=16; $g"|bc)$(echo "obase=16; $b"|bc)
let "r = r / d + ra"
let "g = g / d + ga"
let "b = b / d + ba"
colorD=$(echo "obase=16; $r"|bc)$(echo "obase=16; $g"|bc)$(echo "obase=16; $b"|bc)
let "r = r / d + ra"
let "g = g / d + ga"
let "b = b / d + ba"
colorE=$(echo "obase=16; $r"|bc)$(echo "obase=16; $g"|bc)$(echo "obase=16; $b"|bc)
let "r = r / d + ra"
let "g = g / d + ga"
let "b = b / d + ba"
colorF=$(echo "obase=16; $r"|bc)$(echo "obase=16; $g"|bc)$(echo "obase=16; $b"|bc)
let "r = r / d + ra"
let "g = g / d + ga"
let "b = b / d + ba"
colorG=$(echo "obase=16; $r"|bc)$(echo "obase=16; $g"|bc)$(echo "obase=16; $b"|bc)
let "r = r / d + ra"
let "g = g / d + ga"
let "b = b / d + ba"
colorH=$(echo "obase=16; $r"|bc)$(echo "obase=16; $g"|bc)$(echo "obase=16; $b"|bc)


echo 'fade-colors'
echo $colorA
echo $colorB
echo $colorC
echo $colorD
echo $colorE
echo $colorF
echo $colorG
echo $colorH
echo $BKG" - background"
ace='
/*
colors used are:

#'$colorA'
#'$colorB'
#'$colorC'
#'$colorD'
#'$colorE'
#'$colorF'
#'$colorG'
#'$colorH'

*/

body {
    background-color: #'$BKG';
    color: #'$colorA';
}

#outerdocbody {
    background-color: #'$BKG';
}

#innerdocbody {
    background-color: #'$BKG';
}

#sidediv {
    background-color: #'$colorG';
}

.sidedivdelayed {
    color: #'$colorB' !important;
}

.toolbar {
    background-color: #'$colorF';
}

/* extracted from pad.css */

#users {
  background: #'$colorF';
  background: -webkit-linear-gradient( #'$colorD',#'$colorE');
  background: -moz-linear-gradient( #'$colorD',#'$colorE');
  background: -ms-linear-gradient( #'$colorD',#'$colorE');
  background: -o-linear-gradient( #'$colorD',#'$colorE');
  background: linear-gradient( #'$colorD',#'$colorE');
  color: #'$colorA';
  border: 1px solid #'$colorD';
}

.toolbar {
  background: #'$colorF';
  background: -webkit-linear-gradient(#'$colorD', #'$BKG' 80%);
  background: -moz-linear-gradient(#'$colorD', #'$BKG' 80%);
  background: -o-linear-gradient(#'$colorD', #'$BKG' 80%);
  background: -ms-linear-gradient(#'$colorD', #'$BKG' 80%);
  background: linear-gradient(#'$colorD', #'$BKG' 80%);
  border-bottom: 1px solid #'$BKG';
}

#usericon a #online_count {
  color: #'$colorE';
}

#editorloadingbox {
  color: #'$colorD';
}

#myswatchbox {
  border: 1px solid #'$colorH';
}

#mycolorpicker {
  background: #'$colorB';
  border: 1px solid #'$colorC';
}

#mycolorpickersave,
#mycolorpickercancel {
  background: #'$colorD';
  background: -webkit-linear-gradient(#'$colorC', #'$colorD');
  background: -moz-linear-gradient(#'$colorC', #'$colorD');
  background: -o-linear-gradient(#'$colorC', #'$colorD');
  background: -ms-linear-gradient(#'$colorC', #'$colorD');
  background: linear-gradient(#'$colorC', #'$colorD');
  border: 1px solid #'$colorC';
  color: #'$colorA';
}
#mycolorpickerpreview {
  color: #'$colorA';
}

#myusernameedit {
  color: #'$colorA';
}
#myusernameform input.editable {
  border: 1px solid #'$colorF'
}
#myuser .myusernameedithoverable:hover {
  background: #'$colorA';
  color: #'$colorH';
}

#mystatusedit {
  color: #'$colorE';
  border: 1px solid #'$colorC';
}
#myusernameform .editactive,
#myusernameform .editempty {
  border-left: 1px solid #'$colorC';
  border-top: 1px solid #'$colorC';
  border-right: 1px solid #'$colorE';
  border-bottom: 1px solid #'$colorE';
  color: #'$colorH';
}
#myusernameform .editempty {
  background: #'$colorA';
  color: #'$colorG'
}
#myswatchbox, #myusernameedit, #otheruserstable .swatch {
  border: 1px solid #'$colorF' !important;
  color: #'$colorG';
}

#nootherusers {
  color: #'$colorE';
}
#nootherusers a {
  color: #'$colorE'
}
#otheruserstable td {
  color: #'$colorA';
}
#otheruserstable .swatch {
  border: 1px solid #'$colorH';
}
.usertdname {
  color: #'$colorF';
}
.usertdstatus {
  color: #'$colorD';
}
.usertdactivity {
  color: #'$colorE';
}
.usertdname input {
  border: 1px solid #'$colorC';
}

.usertdname input.editactive,
.usertdname input.editempty {
  background: #'$colorA';
  border-left: 1px solid #'$colorC';
  border-top: 1px solid #'$colorC';
  border-right: 1px solid #'$colorE';
  border-bottom: 1px solid #'$colorE';
}
.usertdname input.editempty {
  color: #'$colorE';
}

#chatbox {
  background-color: #'$colorB';
  border-left: 1px solid #'$colorD';
  border-right: 1px solid #'$colorD';
  border-top: 1px solid #'$colorD';
}
#chattext {
  background-color: #'$colorE';
  border: 1px solid #'$colorE';
  color: #'$colorA';
}

#chatlabel {
  color: #'$colorF';
}
#chatinput {
  border: 1px solid #'$colorC';
}
#chaticon {
  border-left: 1px solid #'$colorD';
  border-right: 1px solid #'$colorD';
  border-top: 1px solid #'$colorD';
  background-color: #'$colorA';
}

#chatcounter {
  color: #'$colorE';
}
#titlebar {
  color: #'$colorF';
}

#titlesticky{
  color: #'$colorF';
}
#titlecross {
  color: #'$colorF';
}
.time {
  color: #'$colorG';
}

.exporttype {
  color: #'$colorG';
}

#importmessageabiword {
  color: #'$colorD';
}

#chatthrob {
  background-color: #'$colorH';
  color: #'$colorA';
  background-color: rgb(0,0,0);
  background-color: rgba(0,0,0,0.7);
}
#focusprotector {
  background-color: #'$colorA';
}
#online_count {
  color: #'$colorE';
}

.popup {
  border: 1px solid #'$colorE';
  background: #'$colorF';
  background: -webkit-linear-gradient(#'$colorC', #'$colorD');
  background: -moz-linear-gradient(#'$colorC', #'$colorD');
  background: -ms-linear-gradient(#'$colorC', #'$colorD');
  background: -o-linear-gradient(#'$colorC', #'$colorD');
  background: linear-gradient(#'$colorC', #'$colorD');
  -webkit-box-shadow: 0 0 8px #'$colorE';
  -moz-box-shadow: 0 0 8px #'$colorE';
  box-shadow: 0 2px 4px #'$colorF';
  color: #'$colorA';
}

.popup h1 {
  color: #'$colorB';
}
.popup h2 {
  color: #'$colorB';
}

.stickyChat {
  background-color: #'$colorD' !important;
  border-left: 1px solid #'$colorC' !important;
}

@media all and (max-width: 400px){
  #gritter-notice-wrapper{
    background-color: #'$colorC';
    color:#'$colorH';
  } 
  .gritter-item p{
    color:#'$colorH';
  }
  .gritter-title{
    color:#'$colorH';
  }
}
@media only screen and (min-device-width: 320px) and (max-device-width: 720px) {
    .toolbar ul.menu_right {
      background: #'$colorE';
      background: -webkit-linear-gradient(#'$colorE', #'$colorD' 80%);
      background: -moz-linear-gradient(#'$colorE', #'$colorD' 80%);
      background: -o-linear-gradient(#'$colorE', #'$colorD' 80%);
      background: -ms-linear-gradient(#'$colorE', #'$colorD' 80%);
      background: linear-gradient(#'$colorE', #'$colorD' 80%);
      border-top: 1px solid #'$colorE';
    }

}

.gritter-item {
  color:#'$colorE';
}
.gritter-title {
  text-shadow:1px 1px 0 #'$colorH'; /* Not supported by IE :( */
}
.gritter-close {
  color: #'$colorG';
}
.activeButton{
  background: #'$colorE';
  background: -webkit-linear-gradient(#'$colorE', #'$colorD');
  background: -moz-linear-gradient(#'$colorE', #'$colorD');
  background: -o-linear-gradient(#'$colorE', #'$colorD');
  background: -ms-linear-gradient(#'$colorE', #'$colorD');
  background: linear-gradient(#'$colorE', #'$colorD');
}

#status {
 color: #FFFFFF;
 background-color: #440000;
 font-size: 2em;
}

UL.jqueryFileTree A {
    color: #'$colorD';
}
 
UL.jqueryFileTree A:hover {
    color: #'$colorF'
    background: #'$colorA';
}
'


theme='/* ep_codepad theme  */
body {
    background-color: #'$BKG';
    color: #'$colorA';
}
.syntaxhighlighter .plain,.syntaxhighlighter .plain a{color:#'$(rc)';}
.syntaxhighlighter .comments,.syntaxhighlighter .comments a{color:#'$(rc)';}
.syntaxhighlighter .string,.syntaxhighlighter .string a{color:#'$(rc)';}
.syntaxhighlighter .keyword{color:#'$(rc)';}
.syntaxhighlighter .preprocessor{color:#'$(rc)';}
.syntaxhighlighter .variable{color:#'$(rc)';}
.syntaxhighlighter .value{color:#'$(rc)';}
.syntaxhighlighter .functions{color:#'$(rc)';}
.syntaxhighlighter .constants{color:#'$(rc)';}
.syntaxhighlighter .script{font-weight:bold;color:#'$(rc)';background-color:none;}
.syntaxhighlighter .color1,.syntaxhighlighter .color1 a{color:#'$(rc)';}
.syntaxhighlighter .color2,.syntaxhighlighter .color2 a{color:#'$(rc)';}
.syntaxhighlighter .color3,.syntaxhighlighter .color3 a{color:#'$(rc)';}
.syntaxhighlighter .keyword{font-weight:bold;}
.syntaxhighlighter .xml .keyword{color:#'$(rc)';font-weight:normal;}
.syntaxhighlighter .xml .color1,.syntaxhighlighter .xml .color1 a{color:#'$(rc)';}
.syntaxhighlighter .xml .string{font-style:italic;color:#'$(rc)';}
'


echo "$ace" > aceTheme$name.css
chown codepad:codepad aceTheme$name.css


echo "$theme" > shTheme$name.css
chown codepad:codepad shTheme$name.css


echo "$core" > shCore$name.css
chown codepad:codepad shCore$name.css

