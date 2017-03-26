let vscode = require( 'vscode' )
    clone = require( 'clone' );

function normalizeLineEndings( input ) {
    return input.replace( /\r\n/g, '\n' );
}

function getOptions( inOptions ) {
    inOptions = clone( inOptions ) || {};

    if ( typeof inOptions.normalizeEol === 'undefined' ) {
        inOptions.normalizeEol = true;
    }

    inOptions.caret = inOptions.caret || '^';

    inOptions.language = inOptions.language || 'text';

    inOptions.anchor = inOptions.anchor || {
        start: '[',
        end: ']'
    };

    inOptions.active = inOptions.active || {
        start: '{',
        end: '}'
    };

    return inOptions;
}

/**
 * Returns content of a given editor.
 *
 * @param {TextEditor} editor
 * @param {Object} [options]
 * @param {Boolean} [options.normalizeEol=true] Whether to change Windows-style end of line characters, to Unix-style.
 * @param {String} [options.caret='^'] Character used to represent caret (collapsed selection).
 * @param {Object} [options.anchor]
 * @param {String} [options.anchor.start='['] Selection anchor open character.
 * @param {String} [options.anchor.end=']'] Selection anchor close character.
 * @param {Object} [options.active]
 * @param {String} [options.active.start='{'] Selection active part open character.
 * @param {String} [options.active.end='}'] Selection active part close character.
 * @returns {String}
 */
function getContent( editor, options ) {
    options = getOptions( options );

    let doc = editor.document,
        rng = new vscode.Range( 0, 0, doc.lineCount - 1, doc.lineAt( doc.lineCount - 1 ).text.length ),
        ret = doc.getText( rng );

    if ( options.normalizeEol ) {
        ret = ret.replace( /\r\n/g, '\n' );
    }

    return options.normalizeEol ? normalizeLineEndings( ret ) : ret;
}

function _replaceSelection( content, sel, doc, options ) {
    if ( sel.isEmpty ) {
        let selOffset = doc.offsetAt( sel.start );
        content = content.substr( 0, selOffset ) + options.caret + content.substr( selOffset );
    } else {
        let startOffset = doc.offsetAt( sel.start ),
            endOffset = doc.offsetAt( sel.end ),
            startMarker = sel.start.isEqual( sel.active ) ? options.active.start : options.anchor.start,
            endMarker = sel.end.isEqual( sel.active ) ? options.active.end : options.anchor.end;

        content = content.substr( 0, startOffset ) + startMarker +
            content.substring( startOffset, endOffset ) + endMarker +
            content.substr( endOffset );
    }

    return content;
};

/**
 * Returns content of a given editor as a string. Selection are marked with special characters:
 *
 * * Collapsed selections are marked with `^`
 * * Ranged selections are marked with
 *  * `[` or `]` for **anchor** position, based whether it's a beginning or the end of range,
 *  * `{` or `}` for **active** position, based whether it's a beginning or the end of range.
 *
 * In case of ranged selections, **anchor** is basically a position where you started the range.
 *
 * It supports multiple selections.
 *
 * **Known issues**
 * * Currently it will mess up if there are multiple ranged selections that overlaps with each other. It
 * was designed simplification.
 *
 * @param {TextEditor} editor
 * @param {Object} [options] Options object to be passed to main `getContent` method. See it's docs for reference.
 * @returns {String}
 */
getContent.withSelection = function( editor, options ) {
    options = getOptions( options );

    // Content retrieved can not have lines normalized yet, because it would mess offsets in _replaceSelection
    // by stray `\n`s. So override options.normalizeEol, and store initial val for later.
    let inputNormalizeEol = typeof options.normalizeEol !== 'undefined' ? options.normalizeEol : true;
    options.normalizeEol = false;

    let ret = getContent( editor, options );

    for ( let sel of editor.selections.reverse() ) {
        ret = _replaceSelection( ret, sel, editor.document, options );
    }

    return inputNormalizeEol ? normalizeLineEndings( ret ) : ret;
};

module.exports = getContent;