'use babel';

import autoCompleteHelper from '../lib/providers/autoCompleteHelper';
import viewAutoCompleteProvider from '../lib/providers/viewAutoCompleteProvider';
import path from 'path';
import Project from '../lib/project';

let editor, atomEnvironment;

function initTextEditor(text) {
	editor = atomEnvironment.workspace.buildTextEditor();
	editor.setGrammar(atomEnvironment.grammars.grammarForScopeName('text.alloyxml'));
	editor.insertText(text);
}

function getSuggestions(prefix) {
	return viewAutoCompleteProvider.getSuggestions({
		editor,
		bufferPosition: editor.getCursorBufferPosition(),
		scopeDescriptor: editor.scopeDescriptorForBufferPosition(editor.getCursorBufferPosition()),
		prefix
	});
}

describe('Tag suggestions', function () {

	before(async function () {
		this.timeout(5000);
		autoCompleteHelper.completionsFile = path.join(__dirname, 'data', 'completions');
		atomEnvironment = global.buildAtomEnvironment();
		await atomEnvironment.packages.activatePackage(path.join(__dirname, '..'));
	});

	after(async function () {
		this.timeout(5000);
		autoCompleteHelper.completionsFile = path.join(__dirname, 'data', 'completions');
		atomEnvironment = global.buildAtomEnvironment();
		await atomEnvironment.packages.deactivatePackage(path.join(__dirname, '..'));
	});

	it('should provide tag suggestions', function () {
		Project.isTitaniumApp = true;

		initTextEditor('<W');
		const suggestions = getSuggestions('W');

		expect(suggestions.length).to.equal(4);

		expect(suggestions[0].type).to.equal('tag');
		expect(suggestions[0].displayText).to.equal('WebView');
		expect(suggestions[0].snippet).to.equal('WebView$1>$2</WebView>');
		expect(suggestions[0].rightLabel).to.equal('Ti.UI.WebView');
		expect(suggestions[0].description).to.equal('Ti.UI.WebView: The web view allows you to open an HTML5 based view which can load either local or remote content.');
		expect(suggestions[0].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.WebView');

		expect(suggestions[1].type).to.equal('tag');
		expect(suggestions[1].displayText).to.equal('Widget');
		expect(suggestions[1].snippet).to.equal('Widget$1>$2</Widget>');
		expect(suggestions[1].rightLabel).to.equal('Alloy.Widget');
		expect(suggestions[1].description).to.equal('Alloy.Widget: Widgets are self-contained components that can be easily dropped into an Alloy project.');
		expect(suggestions[1].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Alloy.Widget');

		expect(suggestions[2].type).to.equal('tag');
		expect(suggestions[2].displayText).to.equal('Window');
		expect(suggestions[2].snippet).to.equal('Window$1>$2</Window>');
		expect(suggestions[2].rightLabel).to.equal('Ti.UI.Window');
		expect(suggestions[2].description).to.equal('Ti.UI.Window: The Window is an empty drawing surface or container.');
		expect(suggestions[2].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window');

		expect(suggestions[3].type).to.equal('tag');
		expect(suggestions[3].displayText).to.equal('WindowToolbar');
		expect(suggestions[3].snippet).to.equal('WindowToolbar$1>$2</WindowToolbar>');
		expect(suggestions[3].rightLabel).to.equal('Ti.UI.Window.WindowToolbar');
		expect(suggestions[3].description).to.equal('Ti.UI.Window.WindowToolbar');
		expect(suggestions[3].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window.WindowToolbar');
	});
});

describe('Attribute suggestions', function () {

	before(async function () {
		this.timeout(5000);
		autoCompleteHelper.completionsFile = path.join(__dirname, 'data', 'completions');
		atomEnvironment = global.buildAtomEnvironment();
		await atomEnvironment.packages.activatePackage(path.join(__dirname, '..'));
	});

	after(async function () {
		this.timeout(5000);
		autoCompleteHelper.completionsFile = path.join(__dirname, 'data', 'completions');
		atomEnvironment = global.buildAtomEnvironment();
		await atomEnvironment.packages.deactivatePackage(path.join(__dirname, '..'));
	});

	it('should provide property suggestions', function () {
		Project.isTitaniumApp = true;

		initTextEditor('<Window s');
		const suggestions = getSuggestions('status');

		expect(suggestions.length).to.equal(8);

		expect(suggestions[0].type).to.equal('property');
		expect(suggestions[0].displayText).to.equal('scaleX');
		expect(suggestions[0].snippet).to.equal('scaleX="$1"$0');
		expect(suggestions[0].rightLabel).to.equal('Window');
		expect(suggestions[0].description).to.equal('Ti.UI.Window: Scaling of the view in x-axis in pixels.');
		expect(suggestions[0].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window-property-scaleX');
	});

	it('should provide event suggestions for', function () {
		Project.isTitaniumApp = true;

		initTextEditor('<Window on');
		const suggestions = getSuggestions('on');

		expect(suggestions.length).to.equal(35);

		expect(suggestions[0].type).to.equal('function');
		expect(suggestions[0].displayText).to.equal('onAndroidback');
		expect(suggestions[0].snippet).to.equal('onAndroidback="$1"$0');
		expect(suggestions[0].rightLabel).to.equal('Window');
		expect(suggestions[0].description).to.equal('Ti.UI.Window: androidback event');
		expect(suggestions[0].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window-event-androidback');
	});
});
