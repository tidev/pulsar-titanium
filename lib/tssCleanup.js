'use babel';

import path from 'path';
import Utils from './utils';
import related from './related';

// Matches a top-level TSS selector, e.g. '".container": {' or "'#label[platform=ios]': {"
const SELECTOR_REGEXP = /^[ \t]*(["'])(.*?)\1[ \t]*:[ \t]*\{/;

export default {

	/**
	 * Comment out class and ID selectors in the active TSS file that are not referenced by
	 * the related view or controller.
	 */
	cleanupActiveEditor() {
		const editor = atom.workspace.getActiveTextEditor();
		if (!editor || !this.isCleanableStyleFile(editor.getPath())) {
			return;
		}

		const references = this.getReferences(editor.getPath());
		if (!references) {
			atom.notifications.addWarning('Clean up TSS: no related view found', {
				detail: 'A related XML view is needed to work out which selectors are still in use.'
			});
			return;
		}

		const unused = this.getUnusedBlocks(editor, references);
		if (!unused.length) {
			atom.notifications.addInfo('Clean up TSS: nothing to do', {
				detail: `Every class and ID selector is still used in ${references.fileNames.join(' or ')}.`
			});
			return;
		}

		// One transaction so the whole cleanup is undone by a single undo
		editor.transact(() => {
			// Work bottom up, so commenting a block cannot shift the rows of the ones above it
			for (const block of unused.slice().reverse()) {
				this.commentOutRows(editor, block.startRow, block.endRow);
			}
		});

		const selectors = unused.map(block => block.selector).join(', ');
		atom.notifications.addSuccess(`Clean up TSS: commented out ${unused.length} unused ${unused.length === 1 ? 'block' : 'blocks'}`, {
			detail: `${selectors}\n\nUndo to restore them.`
		});
	},

	/**
	 * A style file can be cleaned up if it is a TSS file with a related view. app.tss is
	 * excluded as it is global - its selectors apply to every view in the project, so they
	 * cannot be judged against a single one.
	 *
	 * @param {String} filePath		path of file to check
	 * @returns {Boolean}
	 */
	isCleanableStyleFile(filePath) {
		if (!filePath || path.parse(filePath).ext !== '.tss') {
			return false;
		}
		if (!Utils.isAlloyProject()) {
			return false;
		}
		return path.basename(filePath) !== 'app.tss';
	},

	/**
	 * Collect the class and ID names referenced by the view and controller related to a
	 * style file. The controller is included as Alloy can apply classes at runtime, via
	 * $.addClass() and friends.
	 *
	 * @param {String} styleFilePath	path of the TSS file
	 * @returns {Object|undefined}		.classes, .ids and .fileNames, or undefined if there is no related view
	 */
	getReferences(styleFilePath) {
		const viewBuffer = Utils.getTextBuffer(related.getTargetPath('xml', styleFilePath));
		if (viewBuffer.isEmpty()) {
			return;
		}

		const classes = new Set();
		const ids = new Set();
		const fileNames = [ path.basename(viewBuffer.getPath()) ];

		viewBuffer.scan(/class=["'](.*?)["']/g, item => {
			for (const className of item.match[1].split(' ')) {
				if (className.length) {
					classes.add(className);
				}
			}
		});
		viewBuffer.scan(/id=["'](.*?)["']/g, item => {
			if (item.match[1].length) {
				ids.add(item.match[1]);
			}
		});

		// The controller can add and remove classes at runtime, and can look up views by ID,
		// so any name mentioned there counts as used. Names built at runtime, e.g.
		// 'row-' + type, cannot be detected either way.
		const controllerBuffer = Utils.getTextBuffer(related.getTargetPath('js', styleFilePath));
		if (!controllerBuffer.isEmpty()) {
			fileNames.push(path.basename(controllerBuffer.getPath()));
			controllerBuffer.scan(/["'`]([^"'`]+)["'`]/g, item => {
				for (const word of item.match[1].split(' ')) {
					if (word.length) {
						classes.add(word);
						ids.add(word);
					}
				}
			});
			controllerBuffer.scan(/\$\.([a-zA-Z_$][\w$]*)/g, item => {
				ids.add(item.match[1]);
			});
		}

		return { classes, ids, fileNames };
	},

	/**
	 * Find the blocks in a TSS file whose selector is a class or ID that is not referenced.
	 * Tag selectors, e.g. "Label", are left alone as they are not tied to an attribute.
	 *
	 * @param {Object} editor			TextEditor for the TSS file
	 * @param {Object} references		.classes and .ids referenced by the related files
	 * @returns {Array}					blocks, each with .selector, .startRow and .endRow
	 */
	getUnusedBlocks(editor, references) {
		const unused = [];

		for (const block of this.getBlocks(editor)) {
			const names = this.parseSelector(block.selector);
			// Ignore tag-only selectors, and anything we could not make sense of
			if (!names.length) {
				continue;
			}
			// A selector is used if every name in it is referenced - '.row.selected' needs both
			const isUsed = names.every(({ type, name }) => {
				return type === 'class' ? references.classes.has(name) : references.ids.has(name);
			});
			if (!isUsed) {
				unused.push(block);
			}
		}

		return unused;
	},

	/**
	 * Split a TSS selector into the class and ID names it depends on, dropping tag names and
	 * qualifiers. '#header.big[platform=ios]' gives the ID 'header' and the class 'big'.
	 *
	 * @param {String} selector		TSS selector, without its surrounding quotes
	 * @returns {Array}				objects with .type ('class' or 'id') and .name
	 */
	parseSelector(selector) {
		// Drop the qualifier, e.g. [platform=ios,android]
		const bare = selector.split('[')[0].trim();
		const names = [];
		const partRegExp = /([.#])([a-zA-Z0-9-_]+)/g;
		let match;
		while ((match = partRegExp.exec(bare)) !== null) {
			names.push({ type: match[1] === '.' ? 'class' : 'id', name: match[2] });
		}
		return names;
	},

	/**
	 * Find every top-level selector block in a TSS file by tracking brace depth. Rows that
	 * are already commented out are skipped, so running the cleanup twice is harmless.
	 *
	 * @param {Object} editor	TextEditor for the TSS file
	 * @returns {Array}			blocks, each with .selector, .startRow and .endRow
	 */
	getBlocks(editor) {
		const blocks = [];
		const lineCount = editor.getLineCount();
		let inBlockComment = false;
		let row = 0;

		while (row < lineCount) {
			const line = editor.lineTextForBufferRow(row);
			const stripped = this.stripComments(line, inBlockComment);
			inBlockComment = stripped.inBlockComment;

			const match = stripped.text.match(SELECTOR_REGEXP);
			if (!match) {
				row++;
				continue;
			}

			// stripComments blanks out string contents, which includes the selector itself.
			// It preserves length though, so the selector can be sliced back out of the raw
			// line: the first quote in the stripped line is the one opening the selector.
			const quoteIndex = stripped.text.indexOf(match[1]);
			const selector = line.substr(quoteIndex + 1, match[2].length);

			const end = this.findBlockEnd(editor, row, stripped.text, inBlockComment);
			if (!end) {
				// Unbalanced braces - the file is mid-edit or malformed, so leave it be
				return blocks;
			}
			blocks.push({ selector, startRow: row, endRow: end.endRow });
			inBlockComment = end.inBlockComment;
			row = end.endRow + 1;
		}

		return blocks;
	},

	/**
	 * Walk forwards from the row a block opens on until its braces balance out.
	 *
	 * @param {Object} editor			TextEditor for the TSS file
	 * @param {Number} startRow			row the block opens on
	 * @param {String} startRowText		startRow with comments already stripped
	 * @param {Boolean} inBlockComment	whether startRow ends inside a block comment
	 * @returns {Object|undefined}		.endRow and .inBlockComment, or undefined if unbalanced
	 */
	findBlockEnd(editor, startRow, startRowText, inBlockComment) {
		const lineCount = editor.getLineCount();
		let depth = this.braceDelta(startRowText);
		let row = startRow;

		while (depth > 0) {
			row++;
			if (row >= lineCount) {
				return;
			}
			const stripped = this.stripComments(editor.lineTextForBufferRow(row), inBlockComment);
			inBlockComment = stripped.inBlockComment;
			depth += this.braceDelta(stripped.text);
		}

		return { endRow: row, inBlockComment };
	},

	/**
	 * Blank out comments and string contents in a line, so braces and colons inside them are
	 * not mistaken for structure.
	 *
	 * @param {String} line				line of TSS
	 * @param {Boolean} inBlockComment	whether the previous line ended inside a block comment
	 * @returns {Object}				.text and .inBlockComment
	 */
	stripComments(line, inBlockComment) {
		let text = '';
		let index = 0;
		let quote;

		while (index < line.length) {
			const rest = line.slice(index);
			if (inBlockComment) {
				const end = rest.indexOf('*/');
				if (end === -1) {
					break;
				}
				// Keep the selector regexp anchored by padding out the comment
				text += ' '.repeat(end + 2);
				index += end + 2;
				inBlockComment = false;
			} else if (quote) {
				// Keep the quotes themselves, blank the contents
				if (rest[0] === '\\') {
					text += '  ';
					index += 2;
				} else if (rest[0] === quote) {
					text += quote;
					index++;
					quote = undefined;
				} else {
					text += ' ';
					index++;
				}
			} else if (rest.startsWith('//')) {
				break;
			} else if (rest.startsWith('/*')) {
				text += '  ';
				index += 2;
				inBlockComment = true;
			} else if (rest[0] === '"' || rest[0] === '\'') {
				quote = rest[0];
				text += quote;
				index++;
			} else {
				text += rest[0];
				index++;
			}
		}

		return { text, inBlockComment };
	},

	/**
	 * Net change in brace depth across a line
	 *
	 * @param {String} text		line with comments and strings already stripped
	 * @returns {Number}
	 */
	braceDelta(text) {
		let delta = 0;
		for (const character of text) {
			if (character === '{') {
				delta++;
			} else if (character === '}') {
				delta--;
			}
		}
		return delta;
	},

	/**
	 * Prefix a range of rows with a line comment. Line comments are used rather than a
	 * wrapping block comment as block comments cannot be nested.
	 *
	 * @param {Object} editor	TextEditor for the TSS file
	 * @param {Number} startRow	first row to comment out
	 * @param {Number} endRow	last row to comment out
	 */
	commentOutRows(editor, startRow, endRow) {
		for (let row = startRow; row <= endRow; row++) {
			const line = editor.lineTextForBufferRow(row);
			const indent = line.match(/^[ \t]*/)[0];
			editor.setTextInBufferRange(
				[ [ row, 0 ], [ row, line.length ] ],
				`${indent}// ${line.slice(indent.length)}`
			);
		}
	}
};
