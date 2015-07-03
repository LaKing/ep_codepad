#!/bin/bash
## Codepad development script 

while true 
    do  
    ssh root@d250.hu "ssh codepad-devel.d250.hu 'rm -fr /var/log/node-project/*'" 
    ssh root@d250.hu "ssh codepad-devel.d250.hu 'cd /srv/highlight.js && node tools/build.js -n && cat /srv/highlight.js/build/highlight.pack.js > /srv/node-project/etherpad-lite/node_modules/ep_codepad/static/js/highlight.codepad.js && chown codepad:codepad /srv/node-project/etherpad-lite/node_modules/ep_codepad/static/js/highlight.codepad.js'" 
    ssh root@d250.hu "ssh codepad-devel.d250.hu 'sc node-project !'" 
    sleep 2 
    firefox --private "http://codepad-devel.d250.hu/p/test.js";  
    ssh root@d250.hu "ssh codepad-devel.d250.hu 'cat /var/log/node-project/err'" 
    ssh root@d250.hu "ssh codepad-devel.d250.hu 'tail /var/log/node-project/log'"
done 

# codepad.d250.hu devell script



