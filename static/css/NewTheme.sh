#!/bin/bash
## This script should help you to build new themes.

name="New"

## Some parameters have to be re-set here - be careful with the values, this scipt is not idiot-proof.
## make sure you get valid color codes.
## By default, we generate darker themes.

## start color - the brightest
rs=250
gs=220
bs=250

## divider : 1 - no fade 2 - normal fade - 3 - crazy
d=2

#step - min 17 - max ~100
ra=22
ga=26
ba=32

## random range
rr=200
gr=200
br=200

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

theme='
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
    font-family: monospace;
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
#myuser .myusernameedithoverable {
  background: #'$colorH';
  color: #'$colorA';
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
  color: #'$colorA';
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
  color:#'$colorA';
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
/* search and replace */

.imputs {
    height: 21px;
}
#padsearch,
#padreplace {
    vertical-align: top;
    font-size: 16px;
    display: inline-block;
    padding: 3px;
    border: solid 1px #ccc;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    line-height: 1.25;
}
/*multi select language*/

.toolbar ul li select {
    border-radius: 0;
    width: 60px;
}
/*stuff*/

.buttonicon {
    background-image: none;
}
.line {
    color: #'$colorE';
}
.term {
    color: #'$colorB';
}
a:link {
    color: #'$colorD';
}
a:visited {
     color: #'$colorE';
}
a:hover {
    color: #'$colorF'
    background: #'$colorA';
}

/* file tree */

UL.jqueryFileTree A {
    color: #'$colorD';
}

UL.jqueryFileTree A:hover {
    color: #'$colorF'
    background: #'$colorA';
}

/* global static additions */

#myusernameform input.editable {     
    font-size: 2em;
} 

/* hint and curly braces */

.warn {
    background-color: #511;
}
.missing {
    background-color: #600;
}
.padsearch_line {
    background-color: #008;
}
.padsearch_term {
    background-color: #080;
    color: #FFF;
    font-weight: bold;
}

/* selection */
::-moz-selection {
    background:rgba(255, 255, 125, 0.99);
    color:#032764;}
::-webkit-selection {
    background:rgba(255, 255, 125, 0.99);
    color:#032764;}
::selection {
    background:rgba(255, 255, 125, 0.99);
    color:#032764;}
    
    
/* LANGUAGES */

/* Javascript */

.hljs-keyword {
    color: #'$(rc)';
    font-weight: bold;
}
.hljs-keywords {
    color: #'$(rc)';
}
.hljs-comment {
    color: #'$(rc)';
}
.hljs-number {
    color: #'$(rc)';
}
.hljs-literal {
    color: #'$(rc)';
    font-weight: bold;
}
.hljs-built_in {
    color: #'$(rc)';
}
.hljs-string {
    color: #'$(rc)';
}
.hljs-regex {
    color: #'$(rc)';
}
.hljs-regexp {
    color: #'$(rc)';
}
.hljs-function {
    color: #'$(rc)';
}
.hljs-title {
    color: #'$(rc)';
}
.hljs-params {
    color: #'$(rc)';
}
.hljs-pi {
    color: #'$(rc)';
}
/* +html+css */

.hljs-tag {
    color: #'$(rc)';
}
.hljs-id {
    color: #'$(rc)';
}
.hljs-class {
    color: #'$(rc)';
}
.hljs-at_rule {
    color: #'$(rc)';
}
.hljs-attr_selector {
    color: #'$(rc)';
}
.hljs-pseudo {
    color: #'$(rc)';
}
.hljs-rule {
    color: #'$(rc)';
}
.hljs-rules {
    color: #'$(rc)';
}
.hljs-attribute {
    color: #'$(rc)';
}
.hljs-value {
    color: #'$(rc)';
}
.hljs-hexcolor {
    color: #'$(rc)';
}
.hljs-important {
    color: #'$(rc)';
}
.hljs-doctype {
    color: #'$(rc)';
}
.hljs-cdata {
    color: #'$(rc)';
}
/* Other languages */

.hljs-addition {
    color: #'$(rc)';
}
.hljs-annotation {
    color: #'$(rc)';
}
.hljs-argument {
    color: #'$(rc)';
}
.hljs-array {
    color: #'$(rc)';
}
.hljs-begin-block {
    color: #'$(rc)';
}
.hljs-blockquote {
    color: #'$(rc)';
}
.hljs-body {
    color: #'$(rc)';
}
.hljs-bullet {
    color: #'$(rc)';
}
.hljs-cbracket {
    color: #'$(rc)';
}
.hljs-cell {
    color: #'$(rc)';
}
.hljs-change {
    color: #'$(rc)';
}
.hljs-char {
    color: #'$(rc)';
}
.hljs-chunk {
    color: #'$(rc)';
}
.hljs-code {
    color: #'$(rc)';
}
.hljs-collection {
    color: #'$(rc)';
}
.hljs-command {
    color: #'$(rc)';
}
.hljs-commands {
    color: #'$(rc)';
}
.hljs-constant {
    color: #'$(rc)';
}
.hljs-container {
    color: #'$(rc)';
}
.hljs-dartdoc {
    color: #'$(rc)';
}
.hljs-date {
    color: #'$(rc)';
}
.hljs-decorator {
    color: #'$(rc)';
}
.hljs-default {
    color: #'$(rc)';
}
.hljs-deletion {
    color: #'$(rc)';
}
.hljs-emphasis {
    color: #'$(rc)';
}
.hljs-end-block {
    color: #'$(rc)';
}
.hljs-envvar {
    color: #'$(rc)';
}
.hljs-expression {
    color: #'$(rc)';
}
.hljs-filename {
    color: #'$(rc)';
}
.hljs-filter {
    color: #'$(rc)';
}
.hljs-flow {
    color: #'$(rc)';
}
.hljs-foreign {
    color: #'$(rc)';
}
.hljs-formula {
    color: #'$(rc)';
}
.hljs-func {
    color: #'$(rc)';
}
.hljs-function_name {
    color: #'$(rc)';
}
.hljs-generics {
    color: #'$(rc)';
}
.hljs-header {
    color: #'$(rc)';
}
.hljs-horizontal_rule {
    color: #'$(rc)';
}
.hljs-import {
    color: #'$(rc)';
}
.hljs-infix {
    color: #'$(rc)';
}
.hljs-inheritance {
    color: #'$(rc)';
}
.hljs-input {
    color: #'$(rc)';
}
.hljs-javadoc {
    color: #'$(rc)';
}
.hljs-javadoctag {
    color: #'$(rc)';
}
.hljs-label {
    color: #'$(rc)';
}
.hljs-link_label {
    color: #'$(rc)';
}
.hljs-link_reference {
    color: #'$(rc)';
}
.hljs-link_url {
    color: #'$(rc)';
}
.hljs-list {
    color: #'$(rc)';
}
.hljs-localvars {
    color: #'$(rc)';
}
.hljs-long_brackets {
    color: #'$(rc)';
}
.hljs-matrix {
    color: #'$(rc)';
}
.hljs-module {
    color: #'$(rc)';
}
.hljs-operator {
    color: #'$(rc)';
}
.hljs-output {
    color: #'$(rc)';
}
.hljs-package {
    color: #'$(rc)';
}
.hljs-param {
    color: #'$(rc)';
}
.hljs-parameter {
    color: #'$(rc)';
}
.hljs-parent {
    color: #'$(rc)';
}
.hljs-phpdoc {
    color: #'$(rc)';
}
.hljs-pod {
    color: #'$(rc)';
}
.hljs-pp {
    color: #'$(rc)';
}
.hljs-pragma {
    color: #'$(rc)';
}
.hljs-preprocessor {
    color: #'$(rc)';
}
.hljs-prompt {
    color: #'$(rc)';
}
.hljs-property {
    color: #'$(rc)';
}
.hljs-quoted {
    color: #'$(rc)';
}
.hljs-record_name {
    color: #'$(rc)';
}
.hljs-request {
    color: #'$(rc)';
}
.hljs-reserved {
    color: #'$(rc)';
}
.hljs-rest_arg {
    color: #'$(rc)';
}
.hljs-shader {
    color: #'$(rc)';
}
.hljs-shading {
    color: #'$(rc)';
}
.hljs-shebang {
    color: #'$(rc)';
}
.hljs-special {
    color: #'$(rc)';
}
.hljs-sqbracket {
    color: #'$(rc)';
}
.hljs-status {
    color: #'$(rc)';
}
.hljs-stl_container {
    color: #'$(rc)';
}
.hljs-stream {
    color: #'$(rc)';
}
.hljs-strong {
    color: #'$(rc)';
}
.hljs-sub {
    color: #'$(rc)';
}
.hljs-subst {
    color: #'$(rc)';
}
.hljs-summary {
    color: #'$(rc)';
}
.hljs-symbol {
    color: #'$(rc)';
}
.hljs-template_comment {
    color: #'$(rc)';
}
.hljs-template_tag {
    color: #'$(rc)';
}
.hljs-type {
    color: #'$(rc)';
}
.hljs-typedef {
    color: #'$(rc)';
}
.hljs-typename {
    color: #'$(rc)';
}
.hljs-var_expand {
    color: #'$(rc)';
}
.hljs-variable {
    color: #'$(rc)';
}
.hljs-winutils {
    color: #'$(rc)';
}
.hljs-xmlDocTag {
    color: #'$(rc)';
}
.hljs-yardoctag {
    color: #'$(rc)';
}
'

echo "$theme" > $name.css
chown -R codepad:codepad styles

echo "$theme" 
