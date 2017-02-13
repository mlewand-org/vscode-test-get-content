
# vscode-test-get-content

Provides a set of helper functions for getting content of the Visual Studio Code instance.

This helper is designed to be used in VSCode tests / extensions only.

## Usage

```javascript
const getContent = require( 'vscode-test-get-content' );

vscode.workspace.openTextDocument( 'myFancyFile.js' )
	.then( ( doc ) => {
		return vscode.window.showTextDocument( doc );
	} )
	.then( textEditor => {
		assert.equal( getContent.getContent( textEditor ), 'let text = "hello world!";' );
	} );
```

```javascript
const getContent = require( 'vscode-test-get-content' );

vscode.workspace.openTextDocument( 'myFancyFile.js' )
	.then( ( doc ) => {
		return vscode.window.showTextDocument( doc );
	} )
	.then( textEditor => {
		// [, ], { and } characters mark a ranged selection.
		textEditor.selection = new vscode.Selection( 0, 4, 0, 8 );
		assert.equal( getContent.getContentWithSelections( textEditor ), 'let [text} = "hello world!";' );
	} );
```

## Selection Markers

There are three selection markers:

* `^` - Marks a collapsed selection. `This is ^random text`.
* `[`, `]` - Marks a ranged selection _anchor point_, so the place where ranged selection is started. `This [is random} text`
* `{`, `}` - Marks a ranged selection _active point_, so the place selection ends. `This [is random} text`