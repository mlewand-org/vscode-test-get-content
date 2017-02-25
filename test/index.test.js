/* global suite, test */
( function() {
    "use strict";

    const assert = require( 'assert' ),
        vscode = require( 'vscode' ),
        path = require( 'path' ),
        mainModule = require( '../src' );

    suite( 'getContent', function() {
        test( 'It works with a single line', function() {
            return vscode.workspace.openTextDocument( path.join( __dirname, '_fixtures', 'singleLine.txt' ) )
                .then( ( doc ) => {
                    return vscode.window.showTextDocument( doc );
                } )
                .then( textEditor => {
                    assert.equal( mainModule( textEditor ), 'aaa bbb' );
                } );
        } );

        test( 'It works with a multiple lines', function() {
            return vscode.workspace.openTextDocument( path.join( __dirname, '_fixtures', 'multiLine.txt' ) )
                .then( ( doc ) => {
                    return vscode.window.showTextDocument( doc );
                } )
                .then( textEditor => {
                    let expected = 'aaa bbb\n' +
                        'ccc ddd\n' +
                        'eee fff';
                    assert.equal( mainModule( textEditor ), expected );
                } );
        } );

        test( 'It normalizes Windows-style line endings', function() {
            return vscode.workspace.openTextDocument( path.join( __dirname, '_fixtures', 'windowsLineEndings.wintxt' ) )
                .then( ( doc ) => {
                    return vscode.window.showTextDocument( doc );
                } )
                .then( textEditor => {
                    assert.equal( mainModule( textEditor ), 'aa\nbb\ncc' );
                } );
        } );

        test( 'Doesn\'t normalize Windows-style line endings if requested', function() {
            return vscode.workspace.openTextDocument( path.join( __dirname, '_fixtures', 'windowsLineEndings.wintxt' ) )
                .then( ( doc ) => {
                    return vscode.window.showTextDocument( doc );
                } )
                .then( textEditor => {
                    let options = { normalizeEol: false };
                    assert.equal( mainModule( textEditor, options ), 'aa\r\nbb\r\ncc' );
                } );
        } );
    } );

    suite( 'getContent.withSelections', function() {
        test( 'It returns a single collapsed selection', function() {
            return vscode.workspace.openTextDocument( path.join( __dirname, '_fixtures', 'singleLine.txt' ) )
                .then( ( doc ) => {
                    return vscode.window.showTextDocument( doc );
                } )
                .then( textEditor => {
                    textEditor.selection = new vscode.Selection( 0, 1, 0, 1 );
                    assert.equal( mainModule.withSelection( textEditor ), 'a^aa bbb' );
                } );
        } );

        test( 'It returns a single collapsed selection multiline', function() {
            return vscode.workspace.openTextDocument( path.join( __dirname, '_fixtures', 'multiLine.txt' ) )
                .then( ( doc ) => {
                    return vscode.window.showTextDocument( doc );
                } )
                .then( textEditor => {
                    let expected = 'aaa ^bbb\n' +
                        'ccc ddd\n' +
                        'eee fff';

                    textEditor.selection = new vscode.Selection( 0, 4, 0, 4 );
                    assert.equal( mainModule.withSelection( textEditor ), expected );
                } );
        } );

        test( 'It returns multiple collapsed selections multiline', function() {
            return vscode.workspace.openTextDocument( path.join( __dirname, '_fixtures', 'multiLine.txt' ) )
                .then( ( doc ) => {
                    return vscode.window.showTextDocument( doc );
                } )
                .then( textEditor => {
                    let expected = 'aaa ^b^bb\n' +
                        'ccc ddd^\n' +
                        '^eee fff';

                    textEditor.selections = [
                        new vscode.Selection( 0, 4, 0, 4 ),
                        new vscode.Selection( 0, 5, 0, 5 ),
                        new vscode.Selection( 1, 7, 1, 7 ),
                        new vscode.Selection( 2, 0, 2, 0 )
                    ];
                    assert.equal( mainModule.withSelection( textEditor ), expected );
                } );
        } );

        test( 'It returns a single ranged selection', function() {
            return vscode.workspace.openTextDocument( path.join( __dirname, '_fixtures', 'singleLine.txt' ) )
                .then( ( doc ) => {
                    return vscode.window.showTextDocument( doc );
                } )
                .then( textEditor => {
                    textEditor.selection = new vscode.Selection( 0, 1, 0, 3 );
                    assert.equal( mainModule.withSelection( textEditor ), 'a[aa} bbb' );
                } );
        } );

        test( 'It returns multiple ranged selections multiline', function() {
            return vscode.workspace.openTextDocument( path.join( __dirname, '_fixtures', 'multiLine.txt' ) )
                .then( ( doc ) => {
                    return vscode.window.showTextDocument( doc );
                } )
                .then( textEditor => {
                    let expected = 'a[aa} bbb\n' +
                        'c{cc d]dd\n' +
                        'eee fff';

                    textEditor.selections = [
                        new vscode.Selection( 0, 1, 0, 3 ),
                        new vscode.Selection( 1, 5, 1, 1 )
                    ];
                    assert.equal( mainModule.withSelection( textEditor ), expected );
                } );
        } );

        test( 'It works with mixed selections', function() {
            return vscode.workspace.openTextDocument( path.join( __dirname, '_fixtures', 'multiLine.txt' ) )
                .then( ( doc ) => {
                    return vscode.window.showTextDocument( doc );
                } )
                .then( textEditor => {
                    let expected = 'a^aa bbb\n' +
                        'c[cc }ddd\n' +
                        'eee fff';

                    textEditor.selections = [
                        new vscode.Selection( 0, 1, 0, 1 ),
                        new vscode.Selection( 1, 1, 1, 4 )
                    ];
                    assert.equal( mainModule.withSelection( textEditor ), expected );
                } );
        } );

        test( 'Doesn\'t normalize Windows-style line endings if requested', function() {
            return vscode.workspace.openTextDocument( path.join( __dirname, '_fixtures', 'windowsLineEndings.wintxt' ) )
                .then( ( doc ) => {
                    return vscode.window.showTextDocument( doc );
                } )
                .then( textEditor => {
                    textEditor.selection = new vscode.Selection( 2, 0, 2, 0 );
                    let options = { normalizeEol: false };
                    assert.equal( mainModule.withSelection( textEditor, options ), 'aa\r\nbb\r\n^cc' );
                } );
        } );
    } );

    suite( 'Readme.md examples', function() {
        const getContent = require( '../src' );

        test( 'getContent example', function() {
            return vscode.workspace.openTextDocument( __dirname + '/_fixtures/myFancyFile.txt' )
                .then( ( doc ) => {
                    return vscode.window.showTextDocument( doc );
                } )
                .then( textEditor => {
                    assert.equal( getContent( textEditor ), 'let text = "hello world!";' );
                } );
        } );

        test( 'getContentWithSelections example', function() {
            return vscode.workspace.openTextDocument( __dirname + '/_fixtures/myFancyFile.txt' )
                .then( ( doc ) => {
                    return vscode.window.showTextDocument( doc );
                } )
                .then( textEditor => {
                    // [, ], { and } characters mark a ranged selection.
                    textEditor.selection = new vscode.Selection( 0, 4, 0, 8 );
                    assert.equal( getContent.withSelection( textEditor ), 'let [text} = "hello world!";' );
                } );
        } );
    } );
} )();