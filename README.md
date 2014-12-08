Turn etherpad into codepad - a collaborative open development enviroment. 

Status: Beta - ~bugfixes mostly until 1.0.0 - bug reports welcome.

This etherpad-lite plugin merges functionality of a few simple plugins, and adds tons of functionality on its own.
Current features:
    
- File Tree view, open files into pads and save them back.
- Syntaxhighlighting for 92 popular languages - based on highlight.js
- Adds themes, properly implemented with css, and a theme generator
- beutify html/css/javascript code with jsBeutify 
- Syntax-check javascipt with jsHint, and display results
- Search and replace in pads, and in the prject tree
- save/commit/push (F2) and run custom commands or scripts

- It sets some reasonable defaults and customizes buttons
- Admin interface based on adminpads
- Can use a hash instead of a password in the users section of settings.json (ep_hash_auth)
- Authentication user name to username, and custom color

Special URI's:

- /files - filetree
- /log - logview
- /v[/folder]/file - quick view-only with syntaxhighlighting
- /p[/folder]/file - open pad for editing

Currently the following codepad parameters are supported in etherpad's settings.json:
- default theme
- project_path to save files
- log_path for displaying logs (parent dir needs execute right)
- button to open a browser to the project
- action to perform when pushing files
- authentication password-hash, custom colors

The use of authentication and authorization over https is strongly recommended.
Unauthorized access to settings.json may expose operating system files, in the name of the user etherpad is run as.

```
  "ep_codepad": { 
    "theme": "Cobalt",
    "project_path": "/srv/project",
    "log_path": "/var/log/codepad/log",
    "play_url": "http://project.local",
    "push_action": "cd /srv/project && git add . && git commit -m codepad-auto"
  },
  "ep_hash_auth": {
    "hash_typ": "sha512",
    "hash_digest": "hex",
    "allow_namechange": "true"
  },
  "users": {
    "Bob": {"hash": "6c98..66d2","is_admin": true, color: "#ff2222"},
    "Al":  {"hash": "c7r2..b72c","is_admin": true, color: "#2244ff"}
  },
```

Codepad is designed to work together with fedora "srvctl", an LXC container and virtual server farm managment tool.
https://githubub.com/LaKing/Fedora-scripts

Known issues:
- while editing, multiline comments in pads don't get highlighted.

Please feel free to send comments, bug-reports, ...
.. and/or in case of professional, or commercial use please donate to support open source software developers.
