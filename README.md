This etherpad-lite plugin merges functionality of simple plugins, and adds some functionality on its own.

- File Tree view, open files into pads and save them back.
- Syntaxhighlighting for 27 popular lanuges - based on alexgorbatchev/syntaxhighlighter
- Adds tons of themes, properly implemented with css, and a theme generator
- beutify html/css/javascript code with jsBeutify 
- Syntax-check javascipt with jsHint, and display results
- save/commit/push and play

- It sets some reasonable defaults and customizes buttons
- Admin interface based on adminpads
- Can use a hash instead of a password in the users section of settings.json (ep_hash_auth)

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

```
  "ep_codepad": { 
    "theme": "Cobalt",
    "project_path": "/srv/project",
    "log_path": "/var/log/codepad/log"
    "play_url": "http://project.local",
    "push_action": "cd /srv/project && git add . && git commit -m codepad-auto"
  },
```

Codepad is designed to work together with fedora "srvctl", an LXC container and virtual server farm managment tool.
https://githubub.com/LaKing/Fedora-scripts

Known issues:
- multiline comments don't get highlighted

Features in progress:
- search and replace in files
- usernames based on logins

Close to the final beta, under heavy development.
Please feel free to test, and contact me with issues.
