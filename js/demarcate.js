/*************************************************************************
*      DemarcateJS is an in-place Markdown editor and decoder            *
*                                                                        *
*      It was written by William Hart (http://www.williamhart.info) to   *
*      run on "textr" (http://to-textr.com/) a new Markdown enabled      *
*      platform to allow writing and sharing of online text              *
*                                                                        *
*                                                                        *
*      This code is provided under a dual MIT, GPL License               *
*      It is also hosted at github:                                      *
*                  - http://will-hart.github.com/demarcate               *
*      Contributions welcome.                                            *
*                                                                        *
*************************************************************************/

/*
 * Bash in an 'indexOf' function if not available
 * (looking at IE I think!)
 */
if(!Array.indexOf){
    Array.prototype.indexOf = function(obj){
        for(var i=0; i<this.length; i++){
            if(this[i]==obj){
                return i;
            }
        }
        return -1;
    }
}

/*
 * Now make a handy 'contains' function which returns true
 * if the element is in the array and false otherwise
 */
Array.prototype.contains = function(obj) {
    return this.indexOf(obj) >= 0;
}

/*
 * Whitelist of tags to include
 */
var demarcate_whitelist = [
    'BODY',
    'DIV',
    'SPAN',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'LI',
    'BLOCKQUOTE',
    'PRE',
    'CODE',
    'A',
    'P',
    'UL',
    'OL',
    'HR',
];

var editor_whitelist = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'li',
    'blockquote',
    'pre',
    'code',
    'p',
]

/*
 * Lookup table for line starts
 */
var line_starts = {
    'H1': '# ',
    'H2': '## ',
    'H3': '### ',
    'H4': '#### ',
    'H5': '##### ',
    'H6': '###### ',
    'LI': ' - ',
    'BLOCKQUOTE': '> ',
    'PRE': '    ',
    'CODE': '    ',
    'A': '[',
    'HR': '\n---------------------\n\n'
};

/*
 * Lookup table for line ends
 */
var line_ends = {
    'H1': '\n\n',
    'H2': '\n\n',
    'H3': '\n\n',
    'H4': '\n\n',
    'H5': '\n\n',
    'H6': '\n\n',
    'LI': '\n',
    'BLOCKQUOTE': '\n\n',
    'PRE': '\n\n',
    'CODE': '\n\n',
    'A': ']',
    'P': '\n\n',
    'DIV': '\n\n',
};

/*
 * A list of elements which have their internal
 * HTML added to the markdown document
 */
var include_internal = [
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'P',
    'BLOCKQUOTE',
    'A', //- not included here as requires special treatment
];

/*
 * Recursively reverse the markdown of the element
 * and its child objects
 */
function demarkdown(elem) {

    // work out what we are looking at
    var node = elem.get(0);
    var tag_name = node.tagName;
    var node_type = node.nodeType;

    // check we are allowed to decode the tag
    if (! demarcate_whitelist.contains(tag_name) && node_type != 3) {
        return "";
    }

    // open the tag
    var result = line_starts[tag_name] == undefined ? "" : line_starts[tag_name];

    // add any inner html
    if (node_type == 3) {
        result += $.trim(node.nodeValue);
    }

    // add child elements
    $.each(elem.contents(), function(index, value) {
        result += demarkdown($(value));
    });

    // close the tag
    result += line_ends[elem.get(0).tagName] == undefined ? "" : line_ends[tag_name];

    // apply special behaviour for <a> tags
    if (tag_name == 'A') {
        result = " " + result + "(" + elem.attr('href') + ") ";
    }

    // return the result
    return result;
}

/*
 * Hook up the 'demarcate' function as a jQuery plugin
 */
(function( $ ){
    $.fn.demarcate = function() {
        result = demarkdown(this);
        $(document).trigger("demarcation_complete", [result]);
        return result;
    };
})( jQuery );

/* 
 * Display an editor textarea
 */
function display_editor(elem) {
    elem = $(elem);
    var tag_name = elem.get(0).tagName;
    console.log("Displaying editor for " + tag_name);
    elem.trigger('demarcate_editor_closed', [elem]);
}

/* 
 * Now hookup whitelisted elements for auto-edit.
 */
(function( $ ){
    $.fn.enable_demarcate = function() {
        // give global access to the demarcate_editor object
        window.demarcate_editor = $(this);

        len = editor_whitelist.length
        for (var i = 0; i < len; i++) {
            live_selector = "#" + this.attr('id') + " " + editor_whitelist[i];
            $(live_selector).on('dblclick', function() {
                display_editor(this);
            });
        }
    };
})( jQuery );

