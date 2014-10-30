#!/bin/bash 

# Last update:2014.09.20-16:00:00 
# 
# DEV ep_codepad publishing script. 
# 
# D250 Laboratories / D250.hu 
# Author: István király 
# LaKing@D250.hu 
# 

g='package.json'


NOW=$(date +%Y.%m.%d-%H:%M:%S) 
echo $NOW  
 
cv=`cat $g | grep "version" | sed 's/[^0-9.]*//g'` 
nv=`echo $cv | awk -F. -v OFS=. 'NF==1{print ++$NF}; NF>1{if(length($NF+1)>length($NF))$(NF-1)++; $NF=sprintf("%0*d", length($NF), ($NF+1)%(10^length($NF))); print}'` 
echo $cv" > "$nv

echo '{
    "name": "ep_codepad",
    "description": "Turn etherpad-lite into a realtime collaborative development environment",
    "keywords": [
        "sourcecode",
            "edit",
            "javascript",
            "html",
            "css",
            "php",
            "bash",
            "code",
            "syntaxhighlight",
            "jsHint",
            "beautify",
            "IDE"
        ],
    "author": {
    "name": "István Király",
    "email": "LaKing@D250.hu",
    "homepage": "http://www.D250.hu"
    },
    "version": "'$nv'",
    "dependencies": {
        "js-beautify": ">=1.5.0",
        "jshint": ">= 2.5.0",
        "log4js": ">= 0.5.x",
        "regexp-quote": "*",
        "mime": ">= 1.2.11"
    },
    "devDependencies": {},
    "optionalDependencies": {},
    "engines": {
        "node": "*"
    },
    "repository": {
        "type": "git",
        "url": "https://github.com/LaKing/ep_codepad"   
    },
    "readmeFilename": "README.md",
    "dist": {
        "shasum": "a8f8e9afb5f219265ffb696ca5cf4cf9c1d778c8"
    }
}' > $g
            
git add .
git commit -m $nv
git push

npm publish

systemctl restart codepad.service
