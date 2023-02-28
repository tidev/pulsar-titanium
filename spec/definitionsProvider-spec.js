'use babel';

import definitionProvider from '../lib/providers/definitionsProvider';
import path from 'path';
import Project from '../lib/project';
import * as sinon from 'sinon';
import * as tce from 'titanium-editor-commons';
import * as fs from 'fs';
import { expect } from 'chai';

let editor, sandbox;
let rawdata = fs.readFileSync(path.join(__dirname, 'data', 'completions.json'));
let completions = JSON.parse(rawdata);

async function initTextEditor(file) {
	editor = await atom.workspace.open(path.join(__dirname, 'data', 'fixtures', 'alloy-project', 'app', file));
}

function getSuggestions(word, range) {
	return definitionProvider.getSuggestionForWord(
		editor,
		word,
		range
	);
}

describe('Definition suggestions', () => {
	before(async function ()  {
		this.timeout(5000);
		sandbox = sinon.createSandbox();
		atom.project.setPaths([path.join(__dirname, 'data', 'fixtures', 'alloy-project')]);
		await atom.packages.triggerDeferredActivationHooks();
		await atom.packages.triggerActivationHook('core:loaded-shell-environment');
		await atom.packages.activatePackage(path.join(__dirname, '..'));
		expect(atom.packages.isPackageActive('titanium')).to.equal(true);
		sandbox.stub(Project, 'sdk').resolves('8.1.0.GA');
		sandbox.stub(tce.completion, 'loadCompletions').resolves(completions);
	});

	after(async function () {
		this.timeout(5000);
		sandbox.restore();
		await atom.packages.deactivatePackage(path.join(__dirname, '..'));
	});

	it('Should suggest to generate i18n strins', async function () {
		Project.isTitaniumApp = true;
		atom.config.set('titanium.project.defaultI18nLanguage', 'fr');
		await initTextEditor('views/sample.xml');
		const suggestions = await getSuggestions('label', {
			start: { row: 13, column: 53 },
			end: { row: 13, column: 62 }
		}
		);
		expect(suggestions.callback[0].title).to.equal('Generate i18n string');
		expect(suggestions.callback[0].rightLabel).to.equal('fr');

	});
});
