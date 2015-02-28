Turn etherpad into codepad, a collaborative online development enviroment. 
http://codepad.etherpad.org

Status: 1.x Feel free to test - bug reports welcome.

This etherpad-lite plugin merges functionality of a few simple plugins, and adds tons of functionality on its own.
Current features:
    
- File Tree view, open files into pads and save them back
- Search in project files, replace all instances file by file
- Syntaxhighlighting for 92 popular languages - based on highlight.js
- Adds themes, properly implemented with css, and a theme generator
- beutify html/css/javascript code with jsBeutify 
- Syntax-check javascipt with jsHint, and display results
- Search and replace in pads in a javascript implementation
- save/commit/push (F2) and run custom commands or scripts

- It sets some reasonable defaults and customizes buttons
- Admin interface based on adminpads
- Can use a hash instead of a password in the users section of settings.json (ep_hash_auth)
- Authentication username to etherpad-username, and custom colors defined in settings.json

Special URI's:

- /files[#URI] - filetree
- /log - logview
- /v[/folder(s)]/file - quick view-only with syntaxhighlighting
- /s[/folder(s)]/file - raw static view-only without anything
- /p[/folder(s)]/file - open pad for editing

Currently the following codepad parameters are supported in etherpad's settings.json:
- default theme
- project_path to save files (needs to be writeable by codepad)
- log_path for displaying logs (parent dir needs execute right)
- customize the button to open a browser to the project
- action to perform when pushing files
- authentication password-hash and the custom colors

The use of authentication and authorization over https is strongly recommended.
Unauthorized access to settings.json may expose operating system files, in the name of the user etherpad is run as.
Install with npm or git, create your settings.json and restart etherpad after installation.

```
  "ep_codepad": { 
    "theme": "Cobalt",
    "project_path": "/srv/project",
    "log_path": "/var/log/codepad/log",
    "play_url": "http://project.local",
    "push_action": "cd /srv/project && git add . && git commit -m 2.x"
  },
  "ep_hash_auth": {
    "hash_typ": "sha512",
    "hash_digest": "hex",
    "allow_namechange": "true"
  },
  "users": {
    "Bud": {"hash": "6c98..66d2","is_admin": true, color: "#ff2222"},
    "Al":  {"hash": "c7r2..b72c","is_admin": true, color: "#2244ff"}
  },
```
Codpad is NOT tested on and not designed for non-linux operating systems, functionality is partially dependant on linux commands and filesystem properties.
Etherpad / mariadb has limitations on folder/file length. Error messages might show up, and might be hard to see with the tree-view on a dark-backgrounded theme.

Codepad is designed to work together with fedora srvctl utility, an LXC container and virtual server farm managment tool. It is recommended to run codepad on a VE or VM.
https://github.com/LaKing/srvctl

Please feel free to send comments, bug-reports, ...
.. and/or in case of professional, or commercial use please donate to support open source software developers, or hire them.
