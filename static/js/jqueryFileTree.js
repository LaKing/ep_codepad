// jQuery File Tree Plugin
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// Visit http://abeautifulsite.net/notebook.php?article=58 for more information
//
// Usage: $('.fileTreeDemo').fileTree( options, callback )
//
// Options:  root           - root folder to display; default = /
//           script         - location of the serverside AJAX file to use; default = jqueryFileTree.php
//           folderEvent    - event to trigger expand/collapse; default = click
//           expandSpeed    - default = 500 (ms); use -1 for no animation
//           collapseSpeed  - default = 500 (ms); use -1 for no animation
//           expandEasing   - easing function to use on expand (optional)
//           collapseEasing - easing function to use on collapse (optional)
//           multiFolder    - whether or not to limit the browser to one subfolder at a time
//           loadMessage    - Message to display while initial tree loads (can be HTML)
//
// History:
//
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// TERMS OF USE
// 
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC. 
//
// Modification for ep_codepad, .. use get instead of post parameters.
// Use different prefix for simple and doubleclick
//
if (jQuery)(function($) {

    $.extend($.fn, {
        fileTree: function(o, h) {
            // Defaults
            //if (!o) var o = {};

            o.root = '/';
            o.script = '/files_connector';
            o.folderEvent = 'click';
            o.expandSpeed = 700;
            o.collapseSpeed = 800;
            o.expandEasing = null;
            o.collapseEasing = null;
            o.multiFolder = false;
            o.loadMessage = 'Loading...';

            $(this).each(function() {

                function showTree(c, t) {
                    $(c).addClass('wait');
                    $(".jqueryFileTree.start").remove();
                    $.get(o.script, {
                        dir: t
                    }, function(data) {
                        $(c).find('.start').html('');
                        $(c).removeClass('wait').append(data);
                        if (o.root == t) $(c).find('UL:hidden').show();
                        else $(c).find('UL:hidden').slideDown({
                            duration: o.expandSpeed,
                            easing: o.expandEasing
                        });
                        bindTree(c);
                    });
                }

                function bindTree(t) {
                    $(t).find('LI A').bind('click', function() {
                        if ($(this).parent().hasClass('directory')) {
                            if ($(this).parent().hasClass('collapsed')) {
                                // Expand
                                if (!o.multiFolder) {
                                    $(this).parent().parent().find('UL').slideUp({
                                        duration: o.collapseSpeed,
                                        easing: o.collapseEasing
                                    });
                                    $(this).parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
                                }
                                $(this).parent().find('UL').remove(); // cleanup
                                showTree($(this).parent(), escape($(this).attr('rel').match(/.*\//)));
                                $(this).parent().removeClass('collapsed').addClass('expanded');
                            } else {
                                // Collapse
                                $(this).parent().find('UL').slideUp({
                                    duration: o.collapseSpeed,
                                    easing: o.collapseEasing
                                });
                                $(this).parent().removeClass('expanded').addClass('collapsed');
                            }
                        } else {
                            var v = $(this).attr('rel');
                            // call the page for view
                            h('/v' + v);
                            // mark it in the filetree
                            $('#fileTree').find('LI A').css("text-decoration", "none").css("font-weight", "normal");
                            $(this).css("text-decoration", "underline").css("font-weight", "bold");
                            // make the changes trackable
                            //parent.location.hash = v;
                            document.title = v.substr(v.lastIndexOf('/') + 1);
                        }
                        return false;
                    });
                    $(t).find('LI A').bind('dblclick', function() {
                        if ($(this).parent().hasClass('directory')) {
                            // nothing to do
                        } else {

                            //alert('dbl '+$(this).attr('rel'));
                            h('/p' + $(this).attr('rel'));
                        }
                        return false;
                    });

                    // Prevent A from triggering the # on non-click events
                    if (o.folderEvent.toLowerCase != 'click') $(t).find('LI A').bind('click', function() {
                        return false;
                    });
                }
                // Loading message
                $(this).html('<ul class="jqueryFileTree start"><li class="wait">' + o.loadMessage + '<li></ul>');
                // Get the initial file list
                showTree($(this), escape(o.root));
            });
        }
    });

})(jQuery);