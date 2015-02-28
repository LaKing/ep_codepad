#!/bin/bash
 while true 
 do 
 ssh root@d250.hu "cd /srv/codepad-devel.d250.hu/rootfs/srv/node-project/etherpad-lite/node_modules/ep_codepad/highlight.js && python3 tools/build.py -n && cat /srv/codepad-devel.d250.hu/rootfs/srv/node-project/etherpad-lite/node_modules/ep_codepad/highlight.js/build/highlight.pack.js > /srv/codepad-devel.d250.hu/rootfs/srv/node-project/etherpad-lite/node_modules/ep_codepad/static/js/highlight.codepad.js && chown codepad:codepad /srv/codepad-devel.d250.hu/rootfs/srv/node-project/etherpad-lite/node_modules/ep_codepad/static/js/highlight.codepad.js"
 ssh root@d250.hu "ssh codepad-devel.d250.hu rc"
 sleep 2 
 firefox --private "https://codepad-devel.d250.hu/p/testt.js"; 
 done 


# codepad.d250.hu devell script - my client side



