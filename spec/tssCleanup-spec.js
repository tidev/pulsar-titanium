'use babel';

import path from 'path';
import * as sinon from 'sinon';
import tssCleanup from '../lib/tssCleanup';
import Utils from '../lib/utils';

let editor, atomEnvironment, sandbox;

const projectPath = path.join(__dirname, 'data', 'fixtures', 'alloy-project');

function initTextEditor(text) {
	editor = atomEnvironment.workspace.buildTextEditor();
	editor.setGrammar(atomEnvironment.grammars.grammarForScopeName('source.css.tss'));
	editor.setText(text);
	return editor;
}

describe('TSS cleanup', function () {

	before(async function () {
		this.timeout(15000);
		sandbox = sinon.createSandbox();
		atomEnvironment = global.buildAtomEnvironment();
		atom.project.setPaths([ projectPath ]);
		await atomEnvironment.packages.triggerDeferredActivationHooks();
		await atomEnvironment.packages.triggerActivationHook('core:loaded-shell-environment');
		await atomEnvironment.packages.activatePackage(path.join(__dirname, '..'));
	});

	after(async function () {
		this.timeout(15000);
		sandbox.restore();
		atomEnvironment = global.buildAtomEnvironment();
		await atomEnvironment.packages.deactivatePackage(path.join(__dirname, '..'));
	});

	describe('#parseSelector', function () {

		it('should return nothing for a tag selector', function () {
			expect(tssCleanup.parseSelector('Label')).to.deep.equal([]);
			expect(tssCleanup.parseSelector('Window[platform=ios]')).to.deep.equal([]);
		});

		it('should parse a class selector', function () {
			expect(tssCleanup.parseSelector('.container')).to.deep.equal([
				{ type: 'class', name: 'container' }
			]);
		});

		it('should parse an ID selector', function () {
			expect(tssCleanup.parseSelector('#label')).to.deep.equal([
				{ type: 'id', name: 'label' }
			]);
		});

		it('should drop platform qualifiers', function () {
			expect(tssCleanup.parseSelector('.row[platform=ios,android]')).to.deep.equal([
				{ type: 'class', name: 'row' }
			]);
		});

		it('should parse compound selectors', function () {
			expect(tssCleanup.parseSelector('Label#header.big')).to.deep.equal([
				{ type: 'id', name: 'header' },
				{ type: 'class', name: 'big' }
			]);
		});
	});

	describe('#getBlocks', function () {

		it('should find top level blocks and their ranges', function () {
			initTextEditor('".a": {\n\tcolor: "red"\n}\n\n"#b": {\n\tfont: {\n\t\tfontSize: 12\n\t}\n}\n');
			expect(tssCleanup.getBlocks(editor)).to.deep.equal([
				{ selector: '.a', startRow: 0, endRow: 2 },
				{ selector: '#b', startRow: 4, endRow: 8 }
			]);
		});

		it('should not treat braces inside strings as structure', function () {
			initTextEditor('".a": {\n\ttitle: "not a } brace"\n}\n');
			expect(tssCleanup.getBlocks(editor)).to.deep.equal([
				{ selector: '.a', startRow: 0, endRow: 2 }
			]);
		});

		it('should skip blocks that are already commented out', function () {
			initTextEditor('// ".a": {\n// \tcolor: "red"\n// }\n\n".b": {\n\tcolor: "blue"\n}\n');
			expect(tssCleanup.getBlocks(editor)).to.deep.equal([
				{ selector: '.b', startRow: 4, endRow: 6 }
			]);
		});

		it('should skip blocks inside a block comment', function () {
			initTextEditor('/*\n".a": {\n\tcolor: "red"\n}\n*/\n".b": {\n\tcolor: "blue"\n}\n');
			expect(tssCleanup.getBlocks(editor)).to.deep.equal([
				{ selector: '.b', startRow: 5, endRow: 7 }
			]);
		});

		it('should bail out on unbalanced braces rather than guess', function () {
			initTextEditor('".a": {\n\tcolor: "red"\n');
			expect(tssCleanup.getBlocks(editor)).to.deep.equal([]);
		});
	});

	describe('#getUnusedBlocks', function () {

		const references = { classes: new Set([ 'container' ]), ids: new Set([ 'label' ]) };

		it('should leave used selectors alone', function () {
			initTextEditor('".container": {\n\tcolor: "red"\n}\n"#label": {\n\tcolor: "blue"\n}\n');
			expect(tssCleanup.getUnusedBlocks(editor, references)).to.deep.equal([]);
		});

		it('should leave tag selectors alone', function () {
			initTextEditor('"Label": {\n\tcolor: "red"\n}\n');
			expect(tssCleanup.getUnusedBlocks(editor, references)).to.deep.equal([]);
		});

		it('should report unused class and ID selectors', function () {
			initTextEditor('".nope": {\n\tcolor: "red"\n}\n"#nope": {\n\tcolor: "blue"\n}\n');
			expect(tssCleanup.getUnusedBlocks(editor, references)).to.deep.equal([
				{ selector: '.nope', startRow: 0, endRow: 2 },
				{ selector: '#nope', startRow: 3, endRow: 5 }
			]);
		});

		it('should require every name in a compound selector to be used', function () {
			initTextEditor('".container.missing": {\n\tcolor: "red"\n}\n');
			expect(tssCleanup.getUnusedBlocks(editor, references)).to.deep.equal([
				{ selector: '.container.missing', startRow: 0, endRow: 2 }
			]);
		});
	});

	describe('#isCleanableStyleFile', function () {

		it('should accept a view style file', function () {
			expect(tssCleanup.isCleanableStyleFile(path.join(projectPath, 'app', 'styles', 'index.tss'))).to.equal(true);
		});

		it('should reject app.tss as it is global', function () {
			expect(tssCleanup.isCleanableStyleFile(path.join(projectPath, 'app', 'styles', 'app.tss'))).to.equal(false);
		});

		it('should reject non-TSS files', function () {
			expect(tssCleanup.isCleanableStyleFile(path.join(projectPath, 'app', 'views', 'index.xml'))).to.equal(false);
		});

		it('should reject a missing path', function () {
			expect(tssCleanup.isCleanableStyleFile(undefined)).to.equal(false);
		});
	});

	describe('#getReferences', function () {

		it('should collect classes and IDs from the related view and controller', function () {
			const references = tssCleanup.getReferences(path.join(projectPath, 'app', 'styles', 'cleanup.tss'));

			expect(references.classes.has('container')).to.equal(true);
			expect(references.classes.has('title')).to.equal(true);
			expect(references.classes.has('big')).to.equal(true);
			expect(references.ids.has('label')).to.equal(true);
			// applied at runtime by the controller, so it must count as used
			expect(references.classes.has('highlighted')).to.equal(true);
			expect(references.classes.has('unused-class')).to.equal(false);
			expect(references.ids.has('unusedId')).to.equal(false);
		});

		it('should return nothing when there is no related view', function () {
			expect(tssCleanup.getReferences(path.join(projectPath, 'app', 'styles', 'no-such-view.tss'))).to.equal(undefined);
		});
	});

	describe('#cleanupActiveEditor', function () {

		it('should comment out only the unused blocks', async function () {
			const styleFile = path.join(projectPath, 'app', 'styles', 'cleanup.tss');
			const tssEditor = await atom.workspace.open(styleFile);
			const original = tssEditor.getText();

			sandbox.stub(atom.workspace, 'getActiveTextEditor').returns(tssEditor);
			sandbox.stub(Utils, 'isAlloyProject').returns(true);

			tssCleanup.cleanupActiveEditor();

			const text = tssEditor.getText();
			expect(text).to.include('// ".unused-class": {');
			expect(text).to.include('// "#unusedId[platform=ios]": {');
			// indentation is kept, the comment marker goes after it
			expect(text).to.include('\t// color: "red"');

			// still used, directly or from the controller
			expect(text).to.include('".container": {');
			expect(text).to.include('"#label": {');
			expect(text).to.include('".title": {');
			expect(text).to.include('".highlighted": {');
			// tag selectors are never touched
			expect(text).to.include('"Label": {');

			// the whole cleanup must undo in one step
			tssEditor.undo();
			expect(tssEditor.getText()).to.equal(original);

			tssEditor.destroy();
		});
	});
});
