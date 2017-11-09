'use babel';

import fs from 'fs';
import path from 'path';
import find from 'find';

import related from '../related';
import Utils from '../utils';

const wordRegExp = /^[	 ]*$|[^\s\\\(\)"':,;<>~!@\$%\^&\*\|\+=\[\]\{\}`\?\…]+/g;
const alloyPathReg = /\/(controllers|views|styles)\/(.*)?\.(js|xml|tss)/;
const suggestions = {
	xml: [
		{ // class
			regExp: /class=["'][\s0-9a-zA-Z-_^]*$/,
			definitionRegExp: function(text){
				return new RegExp(`["']\.${text}["'\[]`, 'g');
			},
			didGenerateCallback: function(text, path){
				// if (callbacks.length === 0 || callbacks.every(c => c.rightLabel === 'styles/app')){
					// let relatedPath = related.getTargetPath('tss');
					return {
						title: `Generate style`,
						rightLabel: path.split('/').pop().split('.')[0],
						showAlways: true,
						callback: function(){
							atom.workspace.open(path, {
								searchAllPanes: true
							}).then(function(te){
								let insertText = atom.config.get('appcelerator-titanium.generationTemplate.classOnTss');
								insertText = insertText.replace(/(\${text})/g, text).replace(/\\n/g, '\n');
								const lastRow = te.getLastBufferRow();
								const lastPosition = [lastRow, te.lineTextForBufferRow(lastRow).length];
								te.setTextInBufferRange([lastPosition, lastPosition], insertText);
								te.setCursorBufferPosition([lastRow + 1, 0]);

								// add blank line if there is no blank line before new code
								if (te.lineTextForBufferRow(lastRow).trim().length) {
									te.setTextInBufferRange([lastPosition, lastPosition], '\n');
									te.setCursorBufferPosition([lastRow + 2, 0]);
								}

								te.scrollToCursorPosition();
							});
						}
					};
				// }
			},
			targetPath: function(text, sourcePath){
				return [
					related.getTargetPath('tss'),
					path.join(Utils.getTiProjectRootPath(), 'app', 'styles', 'app.tss')
				]
			}
		},
		{ // id
			regExp: /id=["'][\s0-9a-zA-Z-_^]*$/,
			definitionRegExp: function(text){
				return new RegExp(`["']#${text}["'\[]`, 'g');
			},
			didGenerateCallback: function(text, path){
				// if (callbacks.length == 0 || callbacks.every(c => c.rightLabel == 'styles/app')){
					// let relatedPath = related.getTargetPath('tss');
					return {
						title: `Generate style`,
						rightLabel: path.split('/').pop().split('.')[0],
						showAlways: true,
						callback: function(){
							atom.workspace.open(path, {
								searchAllPanes: true
							}).then(function(te){
								let insertText = atom.config.get('appcelerator-titanium.generationTemplate.idOnTss')
								insertText = insertText.replace(/(\${text})/g, text).replace(/\\n/g, '\n');
								const lastRow = te.getLastBufferRow();
								const lastPosition = [lastRow, te.lineTextForBufferRow(lastRow).length];
								te.setTextInBufferRange([lastPosition, lastPosition], insertText);
								te.setCursorBufferPosition([lastRow + 1, 0]);

								// add blank line if there is no blank line before new code
								if (te.lineTextForBufferRow(lastRow).trim().length) {
									te.setTextInBufferRange([lastPosition, lastPosition], '\n');
									te.setCursorBufferPosition([lastRow + 2, 0]);
								}

								te.scrollToCursorPosition();
							});
						}
					};
				// }
			},
			targetPath: function(text, sourcePath){
				return [
					related.getTargetPath('tss'),
					path.join(Utils.getTiProjectRootPath(), 'app', 'styles', 'app.tss')
				];
			}
		},
		{ // tag
			regExp: /<$/,
			definitionRegExp: function(text){
				return new RegExp(`["']${text}`, 'g');
			},
			didGenerateCallback: function(text, path){
				// if (callbacks.length == 0 || callbacks.every(c => c.rightLabel == 'styles/app')){
					// let relatedPath = related.getTargetPath('tss');

					if (['Alloy', 'Annotation', 'Collection', 'Menu', 'Model', 'Require', 'Widget'].indexOf(text) !== -1
						|| text.startsWith('/')) return;

					return {
						title: `Generate style`,
						rightLabel: path.split('/').pop().split('.')[0],
						showAlways: true,
						callback: function(){
							atom.workspace.open(path, {
								searchAllPanes: true
							}).then(function(te){
								let insertText = atom.config.get('appcelerator-titanium.generationTemplate.tagOnTss')
								insertText = insertText.replace(/(\${text})/g, text).replace(/\\n/g, '\n');
								const lastRow = te.getLastBufferRow();
								const lastPosition = [lastRow, te.lineTextForBufferRow(lastRow).length];
								te.setTextInBufferRange([lastPosition, lastPosition], insertText);
								te.setCursorBufferPosition([lastRow + 1, 0]);

								// add blank line if there is no blank line before new code
								if (te.lineTextForBufferRow(lastRow).trim().length) {
									te.setTextInBufferRange([lastPosition, lastPosition], '\n');
									te.setCursorBufferPosition([lastRow + 2, 0]);
								}

								te.scrollToCursorPosition();
							});
						}
					};
				// }
			},
			targetPath: function(text, sourcePath){
				return [
					related.getTargetPath('tss'),
					path.join(Utils.getTiProjectRootPath(), 'app', 'styles', 'app.tss')
				];
			}
		},
		{ //handler
			regExp: /on(.*?)=["']$/,
			definitionRegExp: function(text){
				return new RegExp(`function ${text}\\s*?\\(`)
			},
			targetPath: function(text, sourcePath){
				return related.getTargetPath('js')
			},
			didGenerateCallback: function(text){
				// if (callbacks.length == 0){
					let relatedPath = related.getTargetPath('js');
					return {
						title: `Generate Handler Function`,
						rightLabel: relatedPath.split('/').pop().split('.')[0],
						showAlways: true,
						callback: function(){
							atom.workspace.open(relatedPath, {
								searchAllPanes: true
							}).then(function(te){
								let insertText = atom.config.get('appcelerator-titanium.generationTemplate.functionOnJs');
								insertText = insertText.replace(/(\${text})/g, text).replace(/\\n/g, '\n');
								const lastRow = te.getLastBufferRow();
								const lastPosition = [lastRow, te.lineTextForBufferRow(lastRow).length];
								te.setTextInBufferRange([lastPosition, lastPosition], insertText);
								te.setCursorBufferPosition([lastRow + 1, 0]);

								// add blank line if there is no blank line before new code
								if (te.lineTextForBufferRow(lastRow).trim().length) {
									te.setTextInBufferRange([lastPosition, lastPosition], '\n');
									te.setCursorBufferPosition([lastRow + 2, 0]);
								}

								te.scrollToCursorPosition();
							});
						}
					};
				// }
			}
		},
		{ //widget controller
			regExp: /<Widget[\s0-9a-zA-Z-_^='"]*src=["']$/,
			targetPath: function(text, sourcePath){
				return sourcePath.replace(/app\/(.*)$/, `app/widgets/${text}/controllers/widget.js`);
			}
		},
		{ //Required Controller
			regExp: /<Require[\s0-9a-zA-Z-_^='"]*src=["']$/,
			targetPath: function(text, sourcePath){
				return sourcePath.replace(/app\/(.*)$/, `app/controllers/${text}.js`);
			}
		}
	],
	js: [
		{ //require (/lib) name
			regExp: /require\(["']([-a-zA-Z0-9-_\/]*)$/,
			targetPath: function(text, sourcePath){
				return path.join(Utils.getAlloyRootPath(), 'lib', text + '.js');
			}
		},
		{ //controller name
			regExp: /Alloy\.createController\(["']$/,
			targetPath: function(text, sourcePath){
				return sourcePath.replace(/app\/(.*)$/, `app/controllers/${text}.js`)
			}
		},
		{ // collection / model name (instance)
			regExp: /Alloy\.(Collections|Models).instance\(["']$/,
			targetPath: function(text, sourcePath){
				return sourcePath.replace(/app\/(.*)$/, `app/models/${text}.js`)
			}
		},
		{ // collection / model name (create)
			regExp: /Alloy\.create(Collection|Model)\(["']$/,
			targetPath: function(text, sourcePath){
				return sourcePath.replace(/app\/(.*)$/, `app/models/${text}.js`)
			}
		},
		{ //widget name
			regExp: /Alloy\.createWidget\(["']$/,
			targetPath: function(text, sourcePath){
				return sourcePath.replace(/app\/(.*)$/, `app/widgets/${text}/controllers/widget.js`)
			}
		},
		{ //controller name
			regExp: /Widget\.createController\(["']$/,
			targetPath: function(text, sourcePath){
				const dir = path.dirname(sourcePath);
				return path.join(dir, `${text}.js`);
			}
		},
		{ // collection / model name (instance)
			regExp: /Widget\.(Collections|Models).instance\(["']$/,
			targetPath: function(text, sourcePath){
				const dir = path.dirname(sourcePath);
				return path.resolve(dir, `../models/${text}.js`);
			}
		},
		{ // collection / model name (create)
			regExp: /Widget\.create(Collection|Model)\(["']$/,
			targetPath: function(text, sourcePath){
				const dir = path.dirname(sourcePath);
				return path.resolve(dir, `../models/${text}.js`);
			}
		}
	],
	tss: [
		{
			scopes: [
				"source.css.tss",
				"meta.selector.css.tss",
				"entity.other.attribute-name.id.css.tss",
				"punctuation.definition.entity.css.id.tss",
			],
			definitionRegExp: function(text){
				return new RegExp(`id=["']${text.replace('#', '')}`, 'g');
			},
			targetPath: function(text, sourcePath){
				return related.getTargetPath('xml');
			}
		},
		{
			scopes: [
				"source.css.tss",
				"meta.selector.css.tss",
				"entity.other.attribute-name.class.css.tss",
				"punctuation.definition.entity.css.class.tss"
			],
			definitionRegExp: function(text){
				return new RegExp(`class=["']${text.replace('.', '')}`, 'g');
			},
			targetPath: function(text, sourcePath){
				return related.getTargetPath('xml');
			}
		}
	],
	common: [
		// TODO: backwards hyperclick (from string.xml to L(''))
		{
			regExp: /[:\s=,>\)\("]L\(["']*$/,
			definitionRegExp: (text) => {
				return new RegExp(`name=["']${text}["']>(.*)?</`, 'g');
			},
			targetPath: function(){
				const i18nPath = Utils.getI18nPath();
				if (Utils.isExistAsDirectory(i18nPath)) {
					const folders = fs.readdirSync(i18nPath).filter(function(file){
						return fs.statSync(path.join(i18nPath, file)).isDirectory();
					});
	
					return folders.map(function(item){
						return path.join(i18nPath, item, "strings.xml")
					});
				} else {
					return null;
				}
			},
			didGenerateCallback: function(text){
				const defaultLang = atom.config.get('titanium-alloy.defaultI18nLanguage');
				const i18nStringPath = path.join(Utils.getI18nPath(), defaultLang, "strings.xml");
				return {
					title: "NEW i18n String",
					rightLabel: defaultLang,
					callback: function(){

						if (!Utils.isExistAsFile(i18nStringPath)) { //if not, create i18n/strings.xml
							// mkdirp.sync(path.join(Utils.getI18nPath(), defaultLang));
							// fs.writeFileSync(i18nStringPath, '<?xml version="1.0" encoding="UTF-8"?>\n<resources>\n</resources>');
						}

						atom.workspace.open(i18nStringPath, {
							searchAllPanes: true
						}).then(function(te){
							let insertText;
							te.scan(/<\/resources>/, function(iter){
								insertText = `\t<string name="${text}"></string>\n</resources>`;
								te.setTextInBufferRange(iter.range, insertText);
								te.setCursorBufferPosition([iter.range.start.row, insertText.split('><')[0].length + 1]);
							});
							te.scrollToCursorPosition();
						});

					}
				};
			},
			showCallbackAlways: true
		},
		{
			regExp: /image\s*=\s*["'][\s0-9a-zA-Z-_^]*$/,
			targetPath: (text, sourcePath) => {
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

function findDefinition(path, regExp, textEditor) {
	const targetEditor = Utils.getFileEditor(path);
	let callback;
	if (!targetEditor.isEmpty()) {
		targetEditor.scan(regExp, function(item){
			const pathsSplit = path.split('/');
			callback = {
				title: item.match[1] instanceof String ? item.match[1] : item.lineText,
				rightLabel: `${pathsSplit[pathsSplit.length - 2]}/${pathsSplit.pop().split('.')[0]}`,
				callback: function(){
					atom.workspace.open(path, {
						searchAllPanes: true
					}).then(function(te){
						te.setCursorBufferPosition([item.range.start.row, item.range.start.column]);
						te.scrollToCursorPosition();
					});
				}
			};
		});
	}
	return callback;
};

export default {
	providerName: 'appcelerator-titanium',
	priority: 1,
	wordRegExp,
	// grammarScopes: ['alloyxml, tss'],
	getSuggestionForWord(textEditor, text, range) {
		console.log('getSuggestionForWord: ' + text);

		if (!textEditor.getPath()) return;

		// let [isAlloy = false, alloyType, filename, fileExt] = textEditor.getPath().match(alloyPathReg) || [];
		// if (!isAlloy && textEditor.getPath().endsWith('app/alloy.js')) {
		// 	isAlloy = true;
		// 	filename = 'alloy';
		// 	fileExt = 'js'
		// }
		const isAlloy = Utils.isAlloyProject();
		const parsedPath = path.parse(textEditor.getPath());
		filename = parsedPath.name;
		fileExt = parsedPath.ext.replace('.', '');

		const isTiResources = false;//Utils.isTitaniumProject() &&
			//textEditor.getPath().startsWith(path.join(Utils.getTiProjectRootPath(), 'Resources'));

		if (!text || (!isAlloy && !isTiResources)) return;

		const suggestionsForFileType = suggestions[fileExt].concat(suggestions.common);
		if (!suggestionsForFileType || suggestionsForFileType.length === 0) return;

		const lineText = textEditor.getTextInBufferRange([[range.start.row, 0], [range.start.row, range.start.column]]);
		const cursorScopes = textEditor.scopeDescriptorForBufferPosition(range.start).getScopesArray();
		const matchedExpItem = suggestionsForFileType.find(item => {
			if (item.regExp) {
				return item.regExp.test(lineText);
			} else if (item.scopes) {
				return JSON.stringify(item.scopes) === JSON.stringify(cursorScopes)
			}
		});
		console.log(matchedExpItem);
		if (!matchedExpItem) return;

		const definitionRegExp = matchedExpItem.definitionRegExp instanceof Function ? matchedExpItem.definitionRegExp(text) : matchedExpItem.definitionRegExp;
		let targetPath = matchedExpItem.targetPath(text, textEditor.getPath());
		if (!Array.isArray(targetPath)) targetPath = [targetPath];
		let callbacks = [];

		if (definitionRegExp) {
			console.log('1');
			for (let i=0; i<targetPath.length; i++) {
				const callback = findDefinition(targetPath[i], definitionRegExp, textEditor);
				callback && callbacks.push(callback);
			}
		} 


		// show prompt when:
		// - generating new file
		// - generating text in existing file
		// - style exists in multiple files (index.tss, app.tss)
		
		if (callbacks.length === 0) {

			for (let i=0; i<targetPath.length; i++) {

				console.log('2');
				if (matchedExpItem.didGenerateCallback instanceof Function) {
					console.log('3');
					const callback = matchedExpItem.didGenerateCallback(text, targetPath[i]);
					callback && callbacks.push(callback);
				} else { 
					console.log('4');
					const filePath = path.parse(targetPath[i]);
					const files = find.fileSync(new RegExp(`${filePath.base}`), filePath.dir);
					if (files.length > 0) { // open file
						console.log('5');
						const callback = {
							callback: function(){
								atom.workspace.open(targetPath[i], { searchAllPanes: true });
							}
						};
						callback && callbacks.push(callback);
					} else { // generate file with prompt
						console.log('6');
						const callback = {
							title: 'Generate...',
							rightLabel: filePath.base,
							callback: function(){
								atom.workspace.open(targetPath[i]);
							},
							showAlways: true
						};
						callback && callbacks.push(callback);
					}
				}
			}
		}

		console.log(callbacks);

		if (callbacks.length === 0) return;

		if (callbacks.length === 1 && !callbacks[0].showAlways) {
			// || callbacks.every(callback => !callback.showAlways)) {
				return {
					range,
					callback: callbacks[0].callback
				}
			}

		return {
			range: range,
			// callback: callbacks.length === 0 || (!matchedExpItem.showCallbackAlways && !callbacks.showAlways) ? callbacks[0].callback : callbacks
			callback: callbacks
		};
	}
}
