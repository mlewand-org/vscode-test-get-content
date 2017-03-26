
# vscode-test-get-content [![Build Status](https://travis-ci.org/mlewand-org/vscode-test-get-content.svg?branch=master)](https://travis-ci.org/mlewand-org/vscode-test-get-content)

Provides a set of helper functions for getting content of the Visual Studio Code instance.

This helper is designed to be used in VSCode tests / extensions only.

## Usage

Simply getting the editor's content:

```javascript
const vscode = vscode = require( 'vscode' ),
	getContent = require( 'vscode-test-get-content' );

vscode.workspace.openTextDocument( __dirname + '/_fixtures/myFancyFile.txt' )
	.then( ( doc ) => {
		return vscode.window.showTextDocument( doc );
	} )
	.then( textEditor => {
		assert.equal( getContent( textEditor ), 'let text = "hello world!";' );
	} );
```

Getting the content with selections:

```javascript
const vscode = vscode = require( 'vscode' ),
	getContent = require( 'vscode-test-get-content' );

vscode.workspace.openTextDocument( __dirname + '/_fixtures/myFancyFile.txt' )
	.then( ( doc ) => {
		return vscode.window.showTextDocument( doc );
	} )
	.then( textEditor => {
		// [, ], { and } characters mark a ranged selection.
		textEditor.selection = new vscode.Selection( 0, 4, 0, 8 );
		assert.equal( getContent.withSelection( textEditor ), 'let [text} = "hello world!";' );
	} );
```

## Options

Both main `getContent` and `withSelection` methods take optional `options` object as a second argument.

* `options.normalizeEol` - Boolean - Whether to change Windows-style end of line characters, to Unix-style. Defaults to `true`.
* `options.caret` - String - Character used to represent caret (collapsed selection). Defaults to `"^"`.
* `options.anchor.start` - String - Selection anchor open character. Defaults to `"["`.
* `options.anchor.end` - String - Selection anchor close character. Defaults to `"]"`.
* `options.active.start` - String - Selection active part open character. Defaults to `"{"`.
* `options.active.end` - String - Selection active part close character. Defaults to `"}"`.

## Selection Markers

There are three selection markers:

* `^` - Marks a collapsed selection. `This is ^random text`
* `[`, `]` - Marks a ranged selection _anchor point_, so the place where ranged selection is started. `This [is random} text`
* `{`, `}` - Marks a ranged selection _active point_, so the place selection ends. `This [is random} text`

### Markers Customization

If the default makers collide with your test case, you can use custom markers by passing `options` object, just like below:

```javascript
const vscode = vscode = require( 'vscode' ),
	getContent = require( 'vscode-test-get-content' );

vscode.workspace.openTextDocument( __dirname + '/_fixtures/myFancyFile.txt' )
	.then( ( doc ) => {
		return vscode.window.showTextDocument( doc );
	} )
	.then( textEditor => {
		let options = {
			caret: '🍕',
			active: {
				start: '🚒',
				end: '🚒'
			},
			anchor: {
				start: '🦄',
				end: '🦄'
			}
		};

		textEditor.selection = new vscode.Selection( 0, 4, 0, 8 ); // Select "text"" word.
		assert.equal( getContent.withSelection( textEditor, options ), 'let 🦄text🚒 = "hello world!";' );
	} );
```

## Related

If you need to easily set your content with or without selection, be sure to check [vscode-test-set-content](https://www.npmjs.com/package/vscode-test-set-content) package. It follows the same idea, and allows you to set the content and selection in similarly easy way.