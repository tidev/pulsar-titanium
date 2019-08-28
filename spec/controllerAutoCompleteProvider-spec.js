'use babel';

import controllerAutoCompleteProvider from '../lib/providers/controllerAutoCompleteProvider';
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
	editor.setGrammar(atomEnvironment.grammars.grammarForScopeName([ 'source.js', 'variable.other.object.property.unquoted' ]));
	editor.insertText(text);
}

function getSuggestions(prefix) {
	return controllerAutoCompleteProvider.getSuggestions({
		editor,
		bufferPosition: editor.getCursorBufferPosition(),
		scopeDescriptor: editor.scopeDescriptorForBufferPosition(editor.getCursorBufferPosition()),
		prefix
	});
}

describe('Ti namespace suggestions', function () {

	before(async function () {
		this.timeout(5000);
		sandbox = sinon.createSandbox();
		atomEnvironment = global.buildAtomEnvironment();
		await atomEnvironment.packages.activatePackage(path.join(__dirname, '..'));
		sandbox.stub(Project, 'sdk').resolves('8.0.2.GA');
	});

	after(async function () {
		this.timeout(5000);
		sandbox.restore();
		atomEnvironment = global.buildAtomEnvironment();
		await atomEnvironment.packages.deactivatePackage(path.join(__dirname, '..'));
	});

	it('Should provide suggestions', async function () {
		Project.isTitaniumApp = true;
		sandbox.stub(tce.completion, 'loadCompletions').resolves(completions);

		initTextEditor('Ti.');
		const suggestions = await getSuggestions('Ti.');

		expect(suggestions.length).to.equal(217);

		expect(suggestions[0].type).to.equal('method');
		expect(suggestions[0].displayText).to.equal('Ti.UI');
		expect(suggestions[0].text).to.equal('Ti.UI');
		expect(suggestions[0].api).to.equal('Ti');
		expect(suggestions[0].replacementPrefix).to.equal('Ti.');

		expect(suggestions[1].type).to.equal('method');
		expect(suggestions[1].displayText).to.equal('Ti.API');
		expect(suggestions[1].text).to.equal('Ti.API');
		expect(suggestions[1].api).to.equal('Ti');
		expect(suggestions[1].replacementPrefix).to.equal('Ti.');

		expect(suggestions[2].type).to.equal('method');
		expect(suggestions[2].displayText).to.equal('Ti.Map');
		expect(suggestions[2].text).to.equal('Ti.Map');
		expect(suggestions[2].api).to.equal('Ti');
		expect(suggestions[2].replacementPrefix).to.equal('Ti.');

	});
});

describe('Extended suggestions', function () {

	before(async function () {
		this.timeout(5000);
		sandbox = sinon.createSandbox();
		atomEnvironment = global.buildAtomEnvironment();
		await atomEnvironment.packages.activatePackage(path.join(__dirname, '..'));
		sandbox.stub(Project, 'sdk').resolves('8.0.2.GA');
	});

	after(async function () {
		this.timeout(5000);
		sandbox.restore();
		atomEnvironment = global.buildAtomEnvironment();
		await atomEnvironment.packages.deactivatePackage(path.join(__dirname, '..'));
	});

	it('Should provide property suggestions', async function () {
		Project.isTitaniumApp = true;
		sandbox.stub(tce.completion, 'loadCompletions').resolves(completions);

		initTextEditor('Ti.UI.cre');
		const suggestions = await getSuggestions('cre');

		expect(suggestions.length).to.equal(73);

		expect(suggestions[0].type).to.equal('properties');
		expect(suggestions[0].displayText).to.equal('Ti.UI.tintColor');
		expect(suggestions[0].rightLabel).to.equal('UI');
		expect(suggestions[0].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI');

		expect(suggestions[1].type).to.equal('function');
		expect(suggestions[1].displayText).to.equal('Ti.UI.fireEvent');
		expect(suggestions[1].rightLabel).to.equal('UI');
		expect(suggestions[1].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI');

	});
});
