'use babel';

import autoCompleteHelper from '../lib/providers/autoCompleteHelper';
import path from 'path';
import Project from '../lib/project';
import styleAutoCompleteProvider from '../lib/providers/styleAutoCompleteProvider';

let editor, atomEnvironment;

// eslint-disable-next-line no-unused-vars
function initTextEditor(text) {
	editor = atomEnvironment.workspace.buildTextEditor();
	editor.setGrammar(atomEnvironment.grammars.grammarForScopeName('source.css.tss'));
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

describe('Tag suggestions', function () {

	beforeEach(async function () {
		autoCompleteHelper.completionsFile = path.join(__dirname, 'data', 'completions');
		atomEnvironment = global.buildAtomEnvironment();
		await atomEnvironment.packages.activatePackage(path.join(__dirname, '..'));
	});

	it('should provide tag suggestions', function () {
		Project.isTitaniumApp = true;
		initTextEditor('"W');
		const suggestions = getSuggestions('W');

		expect(suggestions.length).to.equal(4);
		expect(suggestions[0].type).to.equal('tag');
		expect(suggestions[0].text).to.equal('WebView');
		expect(suggestions[0].rightLabel).to.equal('Ti.UI.WebView');
		expect(suggestions[0].description).to.equal('Ti.UI.WebView: The web view allows you to open an HTML5 based view which can load either local or remote content.');
		expect(suggestions[0].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.WebView');

		expect(suggestions[1].type).to.equal('tag');
		expect(suggestions[1].text).to.equal('Widget');
		expect(suggestions[1].rightLabel).to.equal('Alloy.Widget');
		expect(suggestions[1].description).to.equal('Alloy.Widget: Widgets are self-contained components that can be easily dropped into an Alloy project.');
		expect(suggestions[1].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Alloy.Widget');

		expect(suggestions[2].type).to.equal('tag');
		expect(suggestions[2].text).to.equal('Window');
		expect(suggestions[2].rightLabel).to.equal('Ti.UI.Window');
		expect(suggestions[2].description).to.equal('Ti.UI.Window: The Window is an empty drawing surface or container.');
		expect(suggestions[2].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window');

		expect(suggestions[3].type).to.equal('tag');
		expect(suggestions[3].text).to.equal('WindowToolbar');
		expect(suggestions[3].rightLabel).to.equal('Ti.UI.Window.WindowToolbar');
		expect(suggestions[3].description).to.equal('Ti.UI.Window.WindowToolbar');
		expect(suggestions[3].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window.WindowToolbar');
	});
});

describe('Property suggestions', function () {

	it('should provide property name suggestions', function () {
		Project.isTitaniumApp = true;

		initTextEditor('"#id":{s');
		const suggestions = getSuggestions('s');
		expect(suggestions[0].type).to.equal('property');
		expect(suggestions[0].displayText).to.equal('SATELLITE_TYPE');
		expect(suggestions[0].snippet).to.equal('SATELLITE_TYPE: ');

		expect(suggestions[1].type).to.equal('property');
		expect(suggestions[1].displayText).to.equal('saveToPhotoGallery');
		expect(suggestions[1].snippet).to.equal('saveToPhotoGallery: ');

		expect(suggestions[2].type).to.equal('property');
		expect(suggestions[2].displayText).to.equal('scale');
		expect(suggestions[2].snippet).to.equal('scale: ');
	});

	it('should provide correct snippet for object types', function () {
		Project.isTitaniumApp = true;
		initTextEditor('"#id":{f');
		const suggestions = getSuggestions('f');

		// find 'font' suggestion
		const fontSuggestion = suggestions.find(suggestion => suggestion.displayText === 'font');

		expect(fontSuggestion.type).to.equal('property');
		// eslint-disable-next-line no-template-curly-in-string
		expect(fontSuggestion.snippet).to.equal('font: {\n\t${1}\t\n}');
	});

	it('should provide property value suggestions', function () {
		Project.isTitaniumApp = true;
		initTextEditor('"#id":{');
		editor.insertNewline();
		editor.insertText('separatorStyle:');
		const suggestions = getSuggestions('');

		expect(suggestions.length).to.equal(2);

		expect(suggestions[0].type).to.equal('value');
		expect(suggestions[0].text).to.equal('Ti.UI.TABLE_VIEW_SEPARATOR_STYLE_NONE');

		expect(suggestions[1].type).to.equal('value');
		expect(suggestions[1].text).to.equal('Ti.UI.TABLE_VIEW_SEPARATOR_STYLE_SINGLE_LINE');
	});

	it('should provide property no value suggestions with invalid prefix', function () {
		Project.isTitaniumApp = true;
		initTextEditor('"#id":{');
		editor.insertNewline();
		editor.insertText('separatorStyle:');
		const suggestions = getSuggestions('s');

		expect(suggestions.length).to.equal(0);
	});

	it('should provide color values', function () {
		Project.isTitaniumApp = true;
		initTextEditor('"#id":{');
		editor.insertNewline();
		editor.insertText('color: "ma"');
		const suggestions = getSuggestions('"ma"');
		expect(suggestions.length).to.equal(2);
	});
});
