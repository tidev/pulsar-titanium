'use babel';

import fs from 'fs';
import os from 'os';
import path from 'path';
import { expect } from 'chai';
import TitaniumLanguageClient, { continuesWord, findTiapp, resolveServer } from '../lib/languageServer';

function editorFor(filePath, scopeName) {
	return {
		getPath: () => filePath,
		getGrammar: () => ({ scopeName, name: scopeName })
	};
}

describe('Language server', function () {

	let tmp;

	beforeEach(function () {
		tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ti-ls-'));
	});

	afterEach(function () {
		fs.rmSync(tmp, { recursive: true, force: true });
	});

	describe('#findTiapp', function () {
		it('finds a tiapp.xml in the folder', function () {
			fs.writeFileSync(path.join(tmp, 'tiapp.xml'), '<ti:app/>');
			expect(findTiapp(tmp)).to.equal(true);
		});

		it('finds a tiapp.xml in a folder directly inside it', function () {
			fs.mkdirSync(path.join(tmp, 'app'));
			fs.writeFileSync(path.join(tmp, 'app', 'tiapp.xml'), '<ti:app/>');
			expect(findTiapp(tmp)).to.equal(true);
		});

		it('ignores node_modules and deeper folders', function () {
			fs.mkdirSync(path.join(tmp, 'node_modules'));
			fs.writeFileSync(path.join(tmp, 'node_modules', 'tiapp.xml'), '<ti:app/>');
			fs.mkdirSync(path.join(tmp, 'a', 'b'), { recursive: true });
			fs.writeFileSync(path.join(tmp, 'a', 'b', 'tiapp.xml'), '<ti:app/>');
			expect(findTiapp(tmp)).to.equal(false);
		});
	});

	describe('#resolveServer', function () {
		it('resolves the bundled server and its Node range', function () {
			const { serverPath, nodeRange } = resolveServer('');
			expect(fs.existsSync(serverPath)).to.equal(true);
			expect(nodeRange).to.be.a('string').and.not.equal('');
		});

		it('rejects a configured path that does not exist', function () {
			expect(() => resolveServer(path.join(tmp, 'missing.js'))).to.throw(/does not exist/);
		});
	});

	describe('#continuesWord', function () {
		const editor = {};
		const request = (column, prefix, other = editor) => ({ editor: other, prefix, bufferPosition: { row: 1, column } });

		it('continues while the word grows', function () {
			expect(continuesWord(request(2, 'b'), request(4, 'bac'))).to.equal(true);
			expect(continuesWord(request(4, 'bac'), request(4, 'bac'))).to.equal(true);
		});

		it('does not continue once the word shrinks or is retyped', function () {
			expect(continuesWord(request(5, 'back'), request(4, 'bac'))).to.equal(false);
			// "bac" deleted and "top" typed in its place: same start, different text
			expect(continuesWord(request(4, 'bac'), request(4, 'top'))).to.equal(false);
		});

		it('does not continue into another word, line or editor', function () {
			expect(continuesWord(request(4, 'bac'), request(9, 'to'))).to.equal(false);
			expect(continuesWord(request(2, 'b'), { editor, prefix: 'ba', bufferPosition: { row: 2, column: 3 } })).to.equal(false);
			expect(continuesWord(request(2, 'b'), request(3, 'ba', {}))).to.equal(false);
			expect(continuesWord(undefined, request(3, 'ba'))).to.equal(false);
		});
	});

	describe('TitaniumLanguageClient', function () {
		const client = new TitaniumLanguageClient();

		it('reports language ids rather than grammar names', function () {
			expect(client.getLanguageIdFromEditor(editorFor('index.xml', 'text.alloyxml'))).to.equal('xml');
			expect(client.getLanguageIdFromEditor(editorFor('index.tss', 'source.css.tss'))).to.equal('tss');
			expect(client.getLanguageIdFromEditor(editorFor('index.js', 'source.js'))).to.equal('javascript');
			expect(client.getLanguageIdFromEditor(editorFor('tiapp.xml', 'text.xml'))).to.equal('xml');
		});

		it('serves no editor when turned off', function () {
			client.enabled = false;
			expect(client.servesEditor(editorFor(path.join(tmp, 'app', 'views', 'index.xml'), 'text.alloyxml'))).to.equal(false);
			expect(client.shouldStartForEditor(editorFor(path.join(tmp, 'app', 'views', 'index.xml'), 'text.alloyxml'))).to.equal(false);
		});
	});
});
