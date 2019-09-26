'use babel';

import viewAutoCompleteProvider from '../lib/providers/viewAutoCompleteProvider';
import path from 'path';
import Project from '../lib/project';
import * as sinon from 'sinon';
import * as tce from 'titanium-editor-commons';
import * as fs from 'fs';

let editor, atomEnvironment, sandbox;

let rawdata = fs.readFileSync(path.join(__dirname, 'data', 'completions.json'));
let completions = JSON.parse(rawdata);

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
		sandbox = sinon.createSandbox();
		atomEnvironment = global.buildAtomEnvironment();
		await atomEnvironment.packages.activatePackage(path.join(__dirname, '..'));
		sandbox.stub(Project, 'sdk').resolves('8.1.0.GA');
	});

	after(async function () {
		this.timeout(5000);
		sandbox.restore();
		atomEnvironment = global.buildAtomEnvironment();
		await atomEnvironment.packages.deactivatePackage(path.join(__dirname, '..'));
	});

	it('should provide tag suggestions', async function () {
		Project.isTitaniumApp = true;
		sandbox.stub(tce.completion, 'loadCompletions').resolves(completions);

		initTextEditor('<W');
		const suggestions = await getSuggestions('W');

		expect(suggestions.length).to.equal(3);

		expect(suggestions[0].type).to.equal('tag');
		expect(suggestions[0].displayText).to.equal('Widget');
		expect(suggestions[0].snippet).to.equal('Widget$1>$2</Widget>');
		expect(suggestions[0].rightLabel).to.equal('Alloy.Widget');
		expect(suggestions[0].description).to.equal('Alloy.Widget');
		expect(suggestions[0].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Alloy.Widget');

		expect(suggestions[1].type).to.equal('tag');
		expect(suggestions[1].displayText).to.equal('Window');
		expect(suggestions[1].snippet).to.equal('Window$1>$2</Window>');
		expect(suggestions[1].rightLabel).to.equal('Ti.UI.Window');
		expect(suggestions[1].description).to.equal('Ti.UI.Window: The Window is an empty drawing surface or container.');
		expect(suggestions[1].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window');

		expect(suggestions[2].type).to.equal('tag');
		expect(suggestions[2].displayText).to.equal('WindowToolbar');
		expect(suggestions[2].snippet).to.equal('WindowToolbar$1>$2</WindowToolbar>');
		expect(suggestions[2].rightLabel).to.equal('Ti.UI.Window.WindowToolbar');
		expect(suggestions[2].description).to.equal('Ti.UI.Window.WindowToolbar');
		expect(suggestions[2].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window.WindowToolbar');
	});
});

describe('Attribute suggestions', function () {

	before(async function () {
		this.timeout(5000);
		sandbox = sinon.createSandbox();
		atomEnvironment = global.buildAtomEnvironment();
		await atomEnvironment.packages.activatePackage(path.join(__dirname, '..'));
		sandbox.stub(Project, 'sdk').resolves('8.1.0.GA');
	});

	after(async function () {
		this.timeout(5000);
		sandbox.restore();
		atomEnvironment = global.buildAtomEnvironment();
		await atomEnvironment.packages.deactivatePackage(path.join(__dirname, '..'));
	});

	it('should provide property suggestions', async function () {
		Project.isTitaniumApp = true;
		sandbox.stub(tce.completion, 'loadCompletions').resolves(completions);

		initTextEditor('<Window s');
		const suggestions = await getSuggestions('status');

		expect(suggestions.length).to.equal(8);

		expect(suggestions[0].type).to.equal('property');
		expect(suggestions[0].displayText).to.equal('scaleX');
		expect(suggestions[0].snippet).to.equal('scaleX="$1"$0');
		expect(suggestions[0].rightLabel).to.equal('Window');
		expect(suggestions[0].description).to.equal('Ti.UI.Window: Scaling of the view in x-axis in pixels.');
		expect(suggestions[0].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window-property-scaleX');
	});

	it('should provide event suggestions for', async function () {
		Project.isTitaniumApp = true;

		initTextEditor('<Window on');
		const suggestions = await getSuggestions('on');

		expect(suggestions.length).to.equal(35);

		expect(suggestions[0].type).to.equal('function');
		expect(suggestions[0].displayText).to.equal('onOpen');
		expect(suggestions[0].snippet).to.equal('onOpen="$1"$0');
		expect(suggestions[0].rightLabel).to.equal('Window');
		expect(suggestions[0].description).to.equal('Ti.UI.Window: open event');
		expect(suggestions[0].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window-event-open');
	});
});
