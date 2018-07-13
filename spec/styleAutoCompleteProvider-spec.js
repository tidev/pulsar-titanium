'use babel';

/* eslint-env mocha */
/* global waitsForPromise, expect */

import Project from '../lib/project';
import styleAutoCompleteProvider from '../lib/providers/styleAutoCompleteProvider';

let editor;

// eslint-disable-next-line no-unused-vars
function initTextEditor(text) {
	editor = atom.workspace.buildTextEditor();
	editor.setGrammar(atom.grammars.grammarForScopeName('source.css.tss'));
	editor.insertText(text);
}

// eslint-disable-next-line no-unused-vars
function getSuggestions(prefix) {
	return styleAutoCompleteProvider.getSuggestions({
		editor,
		bufferPosition: editor.getCursorBufferPosition(),
		scopeDescriptor: editor.scopeDescriptorForBufferPosition(editor.getCursorBufferPosition()),
		prefix
	});
}

beforeEach(function () {
	waitsForPromise(() =>
		atom.packages.activatePackage('appcelerator-titanium')
	);
});

describe('Tag suggestions', function () {

	it('should provide tag suggestions', function () {
		Project.isTitaniumApp = true;
		initTextEditor('"W');
		const suggestions = getSuggestions('W');

		expect(suggestions.length).toBe(4);
		expect(suggestions[0].type).toBe('tag');
		expect(suggestions[0].text).toBe('WebView');
		expect(suggestions[0].rightLabel).toBe('Ti.UI.WebView');
		expect(suggestions[0].description).toBe('Ti.UI.WebView: The web view allows you to open an HTML5 based view which can load either local or remote content.');
		expect(suggestions[0].descriptionMoreURL).toBe('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.WebView');

		expect(suggestions[1].type).toBe('tag');
		expect(suggestions[1].text).toBe('Widget');
		expect(suggestions[1].rightLabel).toBe('Alloy.Widget');
		expect(suggestions[1].description).toBe('Alloy.Widget: Widgets are self-contained components that can be easily dropped into an Alloy project.');
		expect(suggestions[1].descriptionMoreURL).toBe('http://docs.appcelerator.com/platform/latest/#!/api/Alloy.Widget');

		expect(suggestions[2].type).toBe('tag');
		expect(suggestions[2].text).toBe('Window');
		expect(suggestions[2].rightLabel).toBe('Ti.UI.Window');
		expect(suggestions[2].description).toBe('Ti.UI.Window: The Window is an empty drawing surface or container.');
		expect(suggestions[2].descriptionMoreURL).toBe('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window');

		expect(suggestions[3].type).toBe('tag');
		expect(suggestions[3].text).toBe('WindowToolbar');
		expect(suggestions[3].rightLabel).toBe('Ti.UI.Window.WindowToolbar');
		expect(suggestions[3].description).toBe('Ti.UI.Window.WindowToolbar');
		expect(suggestions[3].descriptionMoreURL).toBe('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window.WindowToolbar');
	});
});

describe('Property suggestions', function () {

	it('should provide property name suggestions', function () {
		Project.isTitaniumApp = true;

		initTextEditor('"#id":{s');
		const suggestions = getSuggestions('s');
		expect(suggestions[0].type).toBe('property');
		expect(suggestions[0].displayText).toBe('SATELLITE_TYPE');
		expect(suggestions[0].snippet).toBe('SATELLITE_TYPE: ');

		expect(suggestions[1].type).toBe('property');
		expect(suggestions[1].displayText).toBe('saveToPhotoGallery');
		expect(suggestions[1].snippet).toBe('saveToPhotoGallery: ');

		expect(suggestions[2].type).toBe('property');
		expect(suggestions[2].displayText).toBe('scale');
		expect(suggestions[2].snippet).toBe('scale: ');
	});

	it('should provide correct snippet for object types', function () {
		Project.isTitaniumApp = true;
		initTextEditor('"#id":{f');
		const suggestions = getSuggestions('f');

		// find 'font' suggestion
		const fontSuggestion = suggestions.find(suggestion => suggestion.displayText === 'font');

		expect(fontSuggestion.type).toBe('property');
		// eslint-disable-next-line no-template-curly-in-string
		expect(fontSuggestion.snippet).toBe('font: {\n\t${1}\t\n}');
	});

	it('should provide property value suggestions', function () {
		Project.isTitaniumApp = true;
		initTextEditor('"#id":{');
		editor.insertNewline();
		editor.insertText('separatorStyle:');
		const suggestions = getSuggestions('');

		expect(suggestions.length).toBe(2);

		expect(suggestions[0].type).toBe('value');
		expect(suggestions[0].text).toBe('Ti.UI.TABLE_VIEW_SEPARATOR_STYLE_NONE');

		expect(suggestions[1].type).toBe('value');
		expect(suggestions[1].text).toBe('Ti.UI.TABLE_VIEW_SEPARATOR_STYLE_SINGLE_LINE');
	});

	it('should provide property no value suggestions with invalid prefix', function () {
		Project.isTitaniumApp = true;
		initTextEditor('"#id":{');
		editor.insertNewline();
		editor.insertText('separatorStyle:');
		const suggestions = getSuggestions('s');

		expect(suggestions.length).toBe(0);
	});
});
