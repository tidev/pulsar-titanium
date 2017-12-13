'use babel';

import fs from 'fs';
import path from 'path';
import find from 'find';
import mkdirp from 'mkdirp';

import related from '../related';
import Project from '../project';
import Utils from '../utils';

const wordRegExp = /^[\t\s]*$|[^\s\\()"':,;<>~!@$%^&*|+=[\]{}`?…]+/g;
// const alloyPathReg = /\/(controllers|views|styles)\/(.*)?\.(js|xml|tss)/;
const suggestions = {
	xml: [
		{ // class
			regExp: /class=["'][\s0-9a-zA-Z-_^]*$/,
			definitionRegExp: function (text) {
				return new RegExp(`["']\\.${text}["'[]`, 'g');
			},
			didGenerateCallback: function (text, filePath) {
				return {
					title: 'Generate style',
					rightLabel: path.parse(filePath).name,
					showAlways: true,
					callback: function () {
						atom.workspace.open(filePath, {
							searchAllPanes: true
						}).then(function (te) {
							let insertText = atom.config.get('appcelerator-titanium.codeTemplates.tssClass');
							insertText = insertText.replace(/(\${text})/g, text).replace(/\\n/g, '\n');
							const lastRow = te.getLastBufferRow();
							const lastPosition = [ lastRow, te.lineTextForBufferRow(lastRow).length ];
							te.setTextInBufferRange([ lastPosition, lastPosition ], insertText);
							te.setCursorBufferPosition([ lastRow + 1, 0 ]);

							// add blank line if there is no blank line before new code
							if (te.lineTextForBufferRow(lastRow).trim().length) {
								te.setTextInBufferRange([ lastPosition, lastPosition ], '\n');
								te.setCursorBufferPosition([ lastRow + 2, 0 ]);
							}

							te.scrollToCursorPosition();
						});
					}
				};
			},
			targetPath: function () {
				return [
					related.getTargetPath('tss'),
					path.join(atom.project.getPaths()[0], 'app', 'styles', 'app.tss')
				];
			}
		},
		{ // id
			regExp: /id=["'][\s0-9a-zA-Z-_^]*$/,
			definitionRegExp: function (text) {
				return new RegExp(`["']#${text}["'[]`, 'g');
			},
			didGenerateCallback: function (text, filePath) {
				return {
					title: 'Generate style',
					rightLabel: path.parse(filePath).name,
					showAlways: true,
					callback: function () {
						atom.workspace.open(filePath, {
							searchAllPanes: true
						}).then(function (te) {
							let insertText = atom.config.get('appcelerator-titanium.codeTemplates.tssId');
							insertText = insertText.replace(/(\${text})/g, text).replace(/\\n/g, '\n');
							const lastRow = te.getLastBufferRow();
							const lastPosition = [ lastRow, te.lineTextForBufferRow(lastRow).length ];
							te.setTextInBufferRange([ lastPosition, lastPosition ], insertText);
							te.setCursorBufferPosition([ lastRow + 1, 0 ]);

							// add blank line if there is no blank line before new code
							if (te.lineTextForBufferRow(lastRow).trim().length) {
								te.setTextInBufferRange([ lastPosition, lastPosition ], '\n');
								te.setCursorBufferPosition([ lastRow + 2, 0 ]);
							}

							te.scrollToCursorPosition();
						});
					}
				};
			},
			targetPath: function () {
				return [
					related.getTargetPath('tss'),
					path.join(atom.project.getPaths()[0], 'app', 'styles', 'app.tss')
				];
			}
		},
		{ // tag
			regExp: /<$/,
			definitionRegExp: function (text) {
				return new RegExp(`["']${text}`, 'g');
			},
			didGenerateCallback: function (text, filePath) {
				if ([ 'Alloy', 'Annotation', 'Collection', 'Menu', 'Model', 'Require', 'Widget' ].indexOf(text) !== -1
					|| text.startsWith('/')) {
					return;
				}

				return {
					title: 'Generate style',
					rightLabel: path.parse(filePath).name,
					showAlways: true,
					callback: function () {
						atom.workspace.open(filePath, {
							searchAllPanes: true
						}).then(function (te) {
							let insertText = atom.config.get('appcelerator-titanium.codeTemplates.tssTag');
							insertText = insertText.replace(/(\${text})/g, text).replace(/\\n/g, '\n');
							const lastRow = te.getLastBufferRow();
							const lastPosition = [ lastRow, te.lineTextForBufferRow(lastRow).length ];
							te.setTextInBufferRange([ lastPosition, lastPosition ], insertText);
							te.setCursorBufferPosition([ lastRow + 1, 0 ]);

							// add blank line if there is no blank line before new code
							if (te.lineTextForBufferRow(lastRow).trim().length) {
								te.setTextInBufferRange([ lastPosition, lastPosition ], '\n');
								te.setCursorBufferPosition([ lastRow + 2, 0 ]);
							}

							te.scrollToCursorPosition();
						});
					}
				};
			},
			targetPath: function () {
				return [
					related.getTargetPath('tss'),
					path.join(atom.project.getPaths()[0], 'app', 'styles', 'app.tss')
				];
			}
		},
		{ // handler
			regExp: /on(.*?)=["']$/,
			definitionRegExp: function (text) {
				return new RegExp(`function ${text}\\s*?\\(`);
			},
			targetPath: function () {
				return related.getTargetPath('js');
			},
			didGenerateCallback: function (text) {
				let relatedPath = related.getTargetPath('js');
				return {
					title: 'Generate Handler Function',
					rightLabel: path.parse(relatedPath).name,
					showAlways: true,
					callback: function () {
						atom.workspace.open(relatedPath, {
							searchAllPanes: true
						}).then(function (te) {
							let insertText = atom.config.get('appcelerator-titanium.codeTemplates.jsFunction');
							insertText = insertText.replace(/(\${text})/g, text).replace(/\\n/g, '\n');
							const lastRow = te.getLastBufferRow();
							const lastPosition = [ lastRow, te.lineTextForBufferRow(lastRow).length ];
							te.setTextInBufferRange([ lastPosition, lastPosition ], insertText);
							te.setCursorBufferPosition([ lastRow + 1, 0 ]);

							// add blank line if there is no blank line before new code
							if (te.lineTextForBufferRow(lastRow).trim().length) {
								te.setTextInBufferRange([ lastPosition, lastPosition ], '\n');
								te.setCursorBufferPosition([ lastRow + 2, 0 ]);
							}

							te.scrollToCursorPosition();
						});
					}
				};
			}
		},
		{ // widget
			regExp: /<Widget[\s0-9a-zA-Z-_^='"]*src=["']$/,
			targetPath: function (text, sourcePath) {
				return sourcePath.replace(/app\/(.*)$/, `app/widgets/${text}/controllers/widget.js`);
			}
		},
		{ // require
			regExp: /<Require[\s0-9a-zA-Z-_^='"]*src=["']$/,
			targetPath: function (text, sourcePath) {
				return sourcePath.replace(/app\/(.*)$/, `app/controllers/${text}.js`);
			}
		}
	],
	js: [
		{ // require (/lib) name
			regExp: /require\(["']([-a-zA-Z0-9-_/]*)$/,
			targetPath: function (text) {
				return path.join(Utils.getAlloyRootPath(), 'lib', text + '.js');
			}
		},
		{ // controller name
			regExp: /Alloy\.createController\(["']$/,
			targetPath: function (text, sourcePath) {
				return sourcePath.replace(/app\/(.*)$/, `app/controllers/${text}.js`);
			}
		},
		{ // collection / model name (instance)
			regExp: /Alloy\.(Collections|Models).instance\(["']$/,
			targetPath: function (text, sourcePath) {
				return sourcePath.replace(/app\/(.*)$/, `app/models/${text}.js`);
			}
		},
		{ // collection / model name (create)
			regExp: /Alloy\.create(Collection|Model)\(["']$/,
			targetPath: function (text, sourcePath) {
				return sourcePath.replace(/app\/(.*)$/, `app/models/${text}.js`);
			}
		},
		{ // widget name
			regExp: /Alloy\.createWidget\(["']$/,
			targetPath: function (text, sourcePath) {
				return sourcePath.replace(/app\/(.*)$/, `app/widgets/${text}/controllers/widget.js`);
			}
		},
		{ // controller name
			regExp: /Widget\.createController\(["']$/,
			targetPath: function (text, sourcePath) {
				const dir = path.dirname(sourcePath);
				return path.join(dir, `${text}.js`);
			}
		},
		{ // collection / model name (instance)
			regExp: /Widget\.(Collections|Models).instance\(["']$/,
			targetPath: function (text, sourcePath) {
				const dir = path.dirname(sourcePath);
				return path.resolve(dir, `../models/${text}.js`);
			}
		},
		{ // collection / model name (create)
			regExp: /Widget\.create(Collection|Model)\(["']$/,
			targetPath: function (text, sourcePath) {
				const dir = path.dirname(sourcePath);
				return path.resolve(dir, `../models/${text}.js`);
			}
		}
	],
	tss: [
		{ // id
			scopes: [
				'source.css.tss',
				'meta.selector.css.tss',
				'entity.other.attribute-name.id.css.tss',
				'punctuation.definition.entity.css.id.tss',
			],
			definitionRegExp: function (text) {
				return new RegExp(`id=["']${text.replace('#', '')}`, 'g');
			},
			targetPath: function () {
				return related.getTargetPath('xml');
			}
		},
		{ // class
			scopes: [
				'source.css.tss',
				'meta.selector.css.tss',
				'entity.other.attribute-name.class.css.tss',
				'punctuation.definition.entity.css.class.tss'
			],
			definitionRegExp: function (text) {
				return new RegExp(`class=["']${text.replace('.', '')}`, 'g');
			},
			targetPath: function () {
				return related.getTargetPath('xml');
			}
		}
	],
	common: [
		{ // i18n
			regExp: /[:\s=,>)("]L\(["']*$/,
			definitionRegExp: function (text) {
				return new RegExp(`name=["']${text}["']>(.*)?</`, 'g');
			},
			targetPath: function () {
				return path.join(Utils.getI18nPath(), atom.config.get('appcelerator-titanium.project.defaultI18nLanguage'), 'strings.xml');
			},
			didGenerateCallback: function (text) {
				const defaultLang = atom.config.get('appcelerator-titanium.project.defaultI18nLanguage');
				const i18nStringPath = path.join(Utils.getI18nPath(), defaultLang, 'strings.xml');
				return {
					title: 'Generate i18n string',
					rightLabel: defaultLang,
					showAlways: true,
					callback: function () {

						if (!Utils.fileExists(i18nStringPath)) {
							mkdirp.sync(path.join(Utils.getI18nPath(), defaultLang));
							fs.writeFileSync(i18nStringPath, '<?xml version="1.0" encoding="UTF-8"?>\n<resources>\n</resources>');
						}
						atom.workspace.open(i18nStringPath, {
							searchAllPanes: true
						}).then(function (te) {
							let insertText;
							te.scan(/<\/resources>/, function (iter) {
								insertText = `\t<string name="${text}"></string>\n</resources>`;
								te.setTextInBufferRange(iter.range, insertText);
								te.setCursorBufferPosition([ iter.range.start.row, insertText.split('><')[0].length + 1 ]);
							});
							te.scrollToCursorPosition();
						});

					}
				};
			}
		},
		{ // image
			regExp: /image\s*=\s*["'][\s0-9a-zA-Z-_^.]*$/,
			targetPath: function (text) {
				const imagePath = path.parse(text);
				const dir = path.join(Utils.getAlloyRootPath(), 'assets', path.dirname(text));
				const files = find.fileSync(new RegExp(`${imagePath.name}.*${imagePath.ext}$`), dir);
				if (files.length > 0) {
					return files[0];
				}
			}
		}
	]
};

function findDefinition(path, regExp) {
	const textBuffer = Utils.getTextBuffer(path);
	let callback;
	if (!textBuffer.isEmpty()) {
		textBuffer.scan(regExp, function (item) {
			const pathsSplit = path.split('/');
			callback = {
				title: item.match[1] instanceof String ? item.match[1] : item.lineText,
				rightLabel: `${pathsSplit[pathsSplit.length - 2]}/${pathsSplit.pop().split('.')[0]}`,
				callback: function () {
					atom.workspace.open(path, {
						searchAllPanes: true
					}).then(function (te) {
						te.setCursorBufferPosition([ item.range.start.row, item.range.start.column ]);
						te.scrollToCursorPosition();
					});
				}
			};
		});
	}
	return callback;
}

export default {
	providerName: 'appcelerator-titanium',
	priority: 1,
	wordRegExp,
	grammarScopes: [ 'text.alloyxml', 'source.css.tss', 'source.js' ],
	getSuggestionForWord(textEditor, text, range) {
		if (!Project.isTitaniumApp || !textEditor.getPath()) {
			return;
		}

		// const isAlloy = Utils.isAlloyProject();
		const parsedPath = path.parse(textEditor.getPath());
		const fileExt = parsedPath.ext.replace('.', '');

		if (!text || (!Project.isTitaniumApp && !Utils.isAlloyProject())) {
			return;
		}

		const suggestionsForFileType = suggestions[fileExt].concat(suggestions.common);
		if (!suggestionsForFileType || suggestionsForFileType.length === 0) {
			return;
		}

		const lineText = textEditor.getTextInBufferRange([ [ range.start.row, 0 ], [ range.start.row, range.start.column ] ]);
		const cursorScopes = textEditor.scopeDescriptorForBufferPosition(range.start).getScopesArray();
		const matchedExpItem = suggestionsForFileType.find(item => {
			if (item.regExp) {
				return item.regExp.test(lineText);
			} else if (item.scopes) {
				return JSON.stringify(item.scopes) === JSON.stringify(cursorScopes);
			}
			return undefined;
		});
		if (!matchedExpItem) {
			return;
		}

		const definitionRegExp = matchedExpItem.definitionRegExp instanceof Function ? matchedExpItem.definitionRegExp(text) : matchedExpItem.definitionRegExp;
		let targetPath = matchedExpItem.targetPath(text, textEditor.getPath());
		if (!Array.isArray(targetPath)) {
			targetPath = [ targetPath ];
		}
		let callbacks = [];

		if (definitionRegExp) {
			for (let i = 0; i < targetPath.length; i++) {
				const callback = findDefinition(targetPath[i], definitionRegExp, textEditor);
				callback && callbacks.push(callback);
			}
		}

		if (callbacks.length === 0) {

			for (let i = 0; i < targetPath.length; i++) {
				if (matchedExpItem.didGenerateCallback instanceof Function) {
					const callback = matchedExpItem.didGenerateCallback(text, targetPath[i]);
					callback && callbacks.push(callback);
				} else {
					const filePath = path.parse(targetPath[i]);
					const files = find.fileSync(new RegExp(`${filePath.base}`), filePath.dir);
					if (files.length > 0) { // open file
						const callback = {
							callback: function () {
								atom.workspace.open(targetPath[i], { searchAllPanes: true });
							}
						};
						callback && callbacks.push(callback);
					} else { // generate file with prompt
						const callback = {
							title: 'Generate...',
							rightLabel: filePath.base,
							callback: function () {
								atom.workspace.open(targetPath[i]);
							},
							showAlways: true
						};
						callback && callbacks.push(callback);
					}
				}
			}
		}

		if (callbacks.length === 0) {
			return;
		}

		if (callbacks.length === 1 && !callbacks[0].showAlways) {
			// || callbacks.every(callback => !callback.showAlways)) {
			return {
				range,
				callback: callbacks[0].callback
			};
		}

		return {
			range: range,
			callback: callbacks
		};
	}
};
