'use babel';

import path from 'path';
import Project from '../lib/project';
import * as sinon from 'sinon';
import styleAutoCompleteProvider from '../lib/providers/styleAutoCompleteProvider';
import * as tce from 'titanium-editor-commons';
import * as fs from 'fs';

let editor, atomEnvironment, sandbox;

let rawdata = fs.readFileSync(path.join(__dirname, 'data', 'completions.json'));
let completions = JSON.parse(rawdata);

function initTextEditor(text) {
	editor = atomEnvironment.workspace.buildTextEditor();
	editor.setGrammar(atomEnvironment.grammars.grammarForScopeName('source.css.tss'));
	editor.insertText(text);
}

async function getSuggestions(prefix) {
	return styleAutoCompleteProvider.getSuggestions({
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

		initTextEditor('"W');
		const suggestions = await getSuggestions('W');

		expect(suggestions.length).to.equal(3);

		expect(suggestions[0].type).to.equal('tag');
		expect(suggestions[0].text).to.equal('Widget');
		expect(suggestions[0].rightLabel).to.equal('Alloy.Widget');
		expect(suggestions[0].description).to.equal('Alloy.Widget');
		expect(suggestions[0].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Alloy.Widget');

		expect(suggestions[1].type).to.equal('tag');
		expect(suggestions[1].text).to.equal('Window');
		expect(suggestions[1].rightLabel).to.equal('Ti.UI.Window');
		expect(suggestions[1].description).to.equal('Ti.UI.Window: The Window is an empty drawing surface or container.');
		expect(suggestions[1].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window');

		expect(suggestions[2].type).to.equal('tag');
		expect(suggestions[2].text).to.equal('WindowToolbar');
		expect(suggestions[2].rightLabel).to.equal('Ti.UI.Window.WindowToolbar');
		expect(suggestions[2].description).to.equal('Ti.UI.Window.WindowToolbar');
		expect(suggestions[2].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window.WindowToolbar');

	});
});

describe('Property suggestions', function () {

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

	it('should provide property name suggestions', async function () {
		Project.isTitaniumApp = true;
		sandbox.stub(tce.completion, 'loadCompletions').resolves(completions);

		initTextEditor('"#id":{s');
		const suggestions = await getSuggestions('s');

		expect(suggestions[0].type).to.equal('property');
		expect(suggestions[0].displayText).to.equal('sys');
		expect(suggestions[0].snippet).to.equal('sys: ');

		expect(suggestions[1].type).to.equal('property');
		expect(suggestions[1].displayText).to.equal('style');
		expect(suggestions[1].snippet).to.equal('style: ');

		expect(suggestions[2].type).to.equal('property');
		expect(suggestions[2].displayText).to.equal('scale');
		expect(suggestions[2].snippet).to.equal('scale: ');
	});

	it('should provide correct snippet for object types', async function () {
		Project.isTitaniumApp = true;
		initTextEditor('"#id":{f');
		const suggestions = await getSuggestions('f');

		// find 'font' suggestion
		const fontSuggestion = suggestions.find(suggestion => suggestion.displayText === 'font');

		expect(fontSuggestion.type).to.equal('property');
		// eslint-disable-next-line no-template-curly-in-string
		expect(fontSuggestion.snippet).to.equal('font: {\n\t${1}\t\n}');
	});

	it('should provide property value suggestions', async function () {
		Project.isTitaniumApp = true;
		initTextEditor('"#id":{');
		editor.insertNewline();
		editor.insertText('separatorStyle:');
		const suggestions = await getSuggestions('');

		expect(suggestions.length).to.equal(2);

		expect(suggestions[0].type).to.equal('value');
		expect(suggestions[0].text).to.equal('Ti.UI.TABLE_VIEW_SEPARATOR_STYLE_NONE');

		expect(suggestions[1].type).to.equal('value');
		expect(suggestions[1].text).to.equal('Ti.UI.TABLE_VIEW_SEPARATOR_STYLE_SINGLE_LINE');
	});

	it('should provide property no value suggestions with invalid prefix', async function () {
		Project.isTitaniumApp = true;
		initTextEditor('"#id":{');
		editor.insertNewline();
		editor.insertText('separatorStyle:');
		const suggestions = await getSuggestions('s');

		expect(suggestions.length).to.equal(0);
	});

	it('should provide color values with quotes', async function () {
		Project.isTitaniumApp = true;
		initTextEditor('"#id":{');
		editor.insertNewline();
		editor.insertText('color: "ma"');
		const suggestions = await getSuggestions('"ma"');
		expect(suggestions.length).to.equal(2);

		expect(suggestions[0].type).to.equal('value');
		expect(suggestions[0].text).to.equal('maroon');

		expect(suggestions[1].type).to.equal('value');
		expect(suggestions[1].text).to.equal('magenta');
	});

	it('should provide color values without quotes', async function () {
		Project.isTitaniumApp = true;
		initTextEditor('"#id":{');
		editor.insertNewline();
		editor.insertText('color: ma');
		const suggestions = await getSuggestions('"m"');
		expect(suggestions.length).to.equal(2);

		expect(suggestions[0].type).to.equal('value');
		expect(suggestions[0].text).to.equal('\'maroon\'');

		expect(suggestions[1].type).to.equal('value');
		expect(suggestions[1].text).to.equal('\'magenta\'');

	});

	it('should provide layout values', async function () {
		Project.isTitaniumApp = true;
		initTextEditor('"#id":{');
		editor.insertNewline();
		editor.insertText('layout: ');
		const suggestions = await getSuggestions('');
		expect(suggestions.length).to.equal(3);

		expect(suggestions[0].type).to.equal('value');
		expect(suggestions[0].text).to.equal('\'vertical\'');

		expect(suggestions[1].type).to.equal('value');
		expect(suggestions[1].text).to.equal('\'composite\'');

		expect(suggestions[2].type).to.equal('value');
		expect(suggestions[2].text).to.equal('\'horizontal\'');

	});
});
