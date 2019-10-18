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
		sandbox.stub(Project, 'sdk').resolves('8.1.0.GA');
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

		expect(suggestions.length).to.equal(202);

		expect(suggestions[0].type).to.equal('method');
		expect(suggestions[0].text).to.equal('Ti.UI');
		expect(suggestions[0].api).to.equal('Ti');
		expect(suggestions[0].replacementPrefix).to.equal('Ti.');

		expect(suggestions[1].type).to.equal('method');
		expect(suggestions[1].text).to.equal('Ti.XML');
		expect(suggestions[1].api).to.equal('Ti');
		expect(suggestions[1].replacementPrefix).to.equal('Ti.');

		expect(suggestions[2].type).to.equal('method');
		expect(suggestions[2].text).to.equal('Ti.API');
		expect(suggestions[2].api).to.equal('Ti');
		expect(suggestions[2].replacementPrefix).to.equal('Ti.');

	});
});

describe('Extended Ti suggestions', function () {

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

	it('Should provide property suggestions', async function () {
		Project.isTitaniumApp = true;
		sandbox.stub(tce.completion, 'loadCompletions').resolves(completions);

		initTextEditor('Ti.UI.cre');
		const suggestions = await getSuggestions('cre');

		expect(suggestions.length).to.equal(73);

		expect(suggestions[0].type).to.equal('properties');
		expect(suggestions[0].displayText).to.equal('Ti.UI.tintColor');
		expect(suggestions[0].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium');

		expect(suggestions[1].type).to.equal('function');
		expect(suggestions[1].displayText).to.equal('Ti.UI.createTab');
		expect(suggestions[1].descriptionMoreURL).to.equal('http://docs.appcelerator.com/platform/latest/#!/api/Titanium');

	});
});

describe('Alloy namespace suggestions', function () {

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

	it('Should provide suggestions', async function () {
		Project.isTitaniumApp = true;
		sandbox.stub(tce.completion, 'loadCompletions').resolves(completions);

		initTextEditor('Alloy.');
		const suggestions = await getSuggestions('Alloy.');

		expect(suggestions.length).to.equal(16);

		expect(suggestions[0].type).to.equal('method');
		expect(suggestions[0].displayText).to.equal('Alloy');
		expect(suggestions[0].text).to.equal('Alloy');
		expect(suggestions[0].api).to.equal('Alloy');
		expect(suggestions[0].replacementPrefix).to.equal('Alloy.');

		expect(suggestions[1].type).to.equal('properties');
		expect(suggestions[1].displayText).to.equal('Alloy.CFG');
		expect(suggestions[1].rightLabel).to.equal('Alloy');
		expect(suggestions[1].snippet).to.equal('CFG');
		expect(suggestions[1].priority).to.equal(2);

		expect(suggestions[2].type).to.equal('properties');
		expect(suggestions[2].displayText).to.equal('Alloy.Models');
		expect(suggestions[2].rightLabel).to.equal('Alloy');
		expect(suggestions[2].snippet).to.equal('Models');
		expect(suggestions[2].priority).to.equal(2);

	});
});

describe('Extended Alloy suggestions', function () {

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

	it('Should provide method suggestions', async function () {
		Project.isTitaniumApp = true;
		sandbox.stub(tce.completion, 'loadCompletions').resolves(completions);

		initTextEditor('Alloy.Co');
		const suggestions = await getSuggestions('Co');

		expect(suggestions.length).to.equal(3);

		expect(suggestions[0].type).to.equal('method');
		expect(suggestions[0].displayText).to.equal('Alloy.Controller');
		expect(suggestions[0].text).to.equal('Alloy.Controller');
		expect(suggestions[0].replacementPrefix).to.equal('Alloy.Co');

		expect(suggestions[1].type).to.equal('method');
		expect(suggestions[1].displayText).to.equal('Alloy.Collections');
		expect(suggestions[1].text).to.equal('Alloy.Collections');
		expect(suggestions[1].replacementPrefix).to.equal('Alloy.Co');

	});

	it('Should provide function suggestions', async function () {
		initTextEditor('Alloy.Controller.get');
		const suggestions = await getSuggestions('get');

		expect(suggestions.length).to.equal(12);

		expect(suggestions[0].type).to.equal('function');
		expect(suggestions[0].displayText).to.equal('Alloy.Controller.getView');
		// eslint-disable-next-line no-template-curly-in-string
		expect(suggestions[0].snippet).to.equal('getView(${1})${0}');
		expect(suggestions[0].rightLabel).to.equal('Controller');

		expect(suggestions[2].type).to.equal('function');
		expect(suggestions[2].displayText).to.equal('Alloy.Controller.getViews');
		// eslint-disable-next-line no-template-curly-in-string
		expect(suggestions[2].snippet).to.equal('getViews(${1})${0}');
		expect(suggestions[2].rightLabel).to.equal('Controller');

	});
});
