'use babel';

import fs from 'fs';
import find from 'find';
import path from 'path';
import Utils from '../utils';
import related from '../related';
import Project from '../project';
import viewAutoCompleteProvider from './viewAutoCompleteProvider';
import alloyAutoCompleteRules from './alloyAutoCompleteRules';
import autoCompleteHelper from './autoCompleteHelper';

// const tagRegExp = /(<([^>]+)>)/ig;
// const propertyNamePrefixPattern = /\.([a-zA-Z]+[-a-zA-Z-_]*)$/;
const alloyIdNamePattern = /\$\.([-a-zA-Z0-9-_]*)$/;
const alloyIdMemberPattern = /\$\.([-a-zA-Z0-9-_]*).([-a-zA-Z0-9-_]*)$/;

let alloy;
let titanium;

const customAlloyCompletionRules = [

	//
	// CommonJS require path - local modules in /app/lib
	// e.g. var bar = require('/foo');
	//
	{
		regExp: /require\(["']([-a-zA-Z0-9-_/]*)$/,
		getCompletions(request) {
			let completions;
			let line = Utils.getLine(request);
			if (this.regExp.test(line)) {
				completions = [];
				let alloyRootPath = Utils.getAlloyRootPath();
				let libPath = path.join(alloyRootPath, 'lib');
				if (Utils.directoryExists(libPath)) {
					let files = find.fileSync(/\.js$/, libPath);
					for (const file of files) {
						let prefix = Utils.getCustomPrefix(request);
						let additionalPrefix = (prefix.startsWith('/') ? '' : '/');

						let value = '/' + file.replace(libPath + path.sep, '').split('.')[0];
						completions.push(autoCompleteHelper.suggestion({
							type: 'require',
							text: value,
							replacementPrefix: additionalPrefix + prefix,
							onDidInsertSuggestion({ editor, triggerPosition, suggestion }) {
								let targetRange = [
									[ triggerPosition.row, 0 ],
									[ triggerPosition.row, triggerPosition.column ]
								];
								let originText = editor.getTextInRange(targetRange);
								if (!(new RegExp(`${suggestion.replacementPrefix}$`)).test(originText)) {
									return editor.setTextInBufferRange(targetRange, originText.replace(new RegExp(`${prefix}$`), `${value}`));
								}
							}
						}));
					}
				}
			}
			return completions;
		}
	},

	//
	// Alloy controller path
	// e.g. Alloy.createController('foo');
	//
	{
		regExp: /Alloy\.(createController|Controllers\.instance)\(["']([-a-zA-Z0-9-_/]*)$/,
		getCompletions(request) {
			let completions;
			let line = Utils.getLine(request);
			if (this.regExp.test(line)) {
				completions = [];
				let alloyRootPath = Utils.getAlloyRootPath();
				let controllerPath = path.join(alloyRootPath, 'controllers');
				if (Utils.directoryExists(controllerPath)) {
					let files = find.fileSync(/\.js$/, controllerPath);
					for (const file of files) {
						// if currentPath != file # exclude current controller
						let prefix = Utils.getCustomPrefix(request);
						let additionalPrefix = (prefix.startsWith('/') ? '' : '/');

						let value = '/' + file.replace(controllerPath + path.sep, '').split('.')[0];
						completions.push(autoCompleteHelper.suggestion({
							type: 'require',
							text: value,
							replacementPrefix: additionalPrefix + prefix,
							onDidInsertSuggestion({ editor, triggerPosition, suggestion }) {
								let targetRange = [
									[ triggerPosition.row, 0 ],
									[ triggerPosition.row, triggerPosition.column ]
								];
								let originText = editor.getTextInRange(targetRange);
								if (!(new RegExp(`${suggestion.replacementPrefix}$`)).test(originText)) {
									return editor.setTextInBufferRange(targetRange, originText.replace(new RegExp(`${prefix}$`), `${value}`));
								}
							}
						}));
					}
				}
			}
			return completions;
		}
	},

	//
	// Alloy widget path
	// e.g. Alloy.createWidget('foo');
	//
	{
		regExp: /Alloy\.(createWidget|Widgets\.instance)\(["']([-a-zA-Z0-9-_/.]*)$/,
		getCompletions(request) {
			let completions;
			let line = Utils.getLine(request);
			if (this.regExp.test(line)) {
				completions = [];
				let alloyRootPath = Utils.getAlloyRootPath();
				let alloyConfigPath = path.join(alloyRootPath, 'config.json');
				try {
					let configObj = JSON.parse(fs.readFileSync(alloyConfigPath));
					for (let widgetName in (configObj ? configObj.dependencies : undefined)) {
						// let value = (configObj !== null ? configObj.dependencies : undefined)[widgetName];
						completions.push(autoCompleteHelper.suggestion({
							type: 'require',
							text: widgetName,
							replacementPrefix: Utils.getCustomPrefix(request)
						}));
					}
				} catch (error) {
					//
				}
			}
			return completions;
		}
	},

	//
	// Alloy model / collection path
	// e.g. Alloy.createModel('foo');
	//
	{
		regExp: /Alloy\.(createModel|Models\.instance|createCollection|Collections\.instance)\(["']([-a-zA-Z0-9-_/]*)$/,
		getCompletions(request) {
			let completions;
			let line = Utils.getLine(request);
			if (this.regExp.test(line)) {
				completions = [];
				let alloyRootPath = Utils.getAlloyRootPath();
				let controllerPath = path.join(alloyRootPath, 'models');
				if (Utils.directoryExists(controllerPath)) {
					let files = find.fileSync(/\.js$/, controllerPath);
					for (const file of files) {
						// if currentPath != file # exclude current controller
						completions.push(autoCompleteHelper.suggestion({
							type: 'require',
							text: file.replace(controllerPath + '/', '').split('.')[0],
							replacementPrefix: Utils.getCustomPrefix(request)
						}));
					}
				}
			}
			return completions;
		}
	},

	//
	// Event name
	// e.g. $.tableView.addEventListener('click', ...);
	//
	{
		regExp: /\$\.([-a-zA-Z0-9-_]*)\.(add|remove)EventListener\(["']([-a-zA-Z0-9-_/]*)$/,
		getCompletions(request) {
			let completions;
			let line = Utils.getLine(request);
			let regResult = this.regExp.exec(line);
			if (regResult) {
				let idName = regResult[1];
				let textBuffer = Utils.getTextBuffer(related.getTargetPath('xml'));

				if (!textBuffer.isEmpty()) {
					completions = [];
					let curTagName = '';
					textBuffer.scan(new RegExp(`id=["']${idName}["']`, 'g'), function (item) {
						curTagName = viewAutoCompleteProvider.getPreviousTag(textBuffer, item.range.start);
						return item.stop();
					});

					if (curTagName && alloy.tags[curTagName]) {
						let { apiName } = alloy.tags[curTagName];
						let curTagObject = titanium.types[apiName];
						for (const event of curTagObject.events) {
							completions.push(autoCompleteHelper.suggestion({
								type: 'event',
								text: event,
								api: apiName,
								property: event
							}));
						}
					}
				}
			}

			return completions;
		}
	},

	{
		regExp: /(?:Ti|Titanium)?\S+/i,
		getCompletions(request) {
			let completions;
			let line = Utils.getLine(request);

			const regResult = line.match(/(Ti|Titanium)\.((?:(?:[A-Z]\w*|iOS|iPad)\.?)*)([a-z]\w*)*$/);
			if (regResult) {

				let apiName;
				let shortApiName;
				let attribute;
				let nameSpace;

				if (regResult && regResult.length === 4) {
					nameSpace = regResult[1];
					apiName = regResult[2];
					attribute = regResult[3];

					shortApiName = 'Ti.' + apiName;

					if (nameSpace === 'Titanium') {
						apiName = 'Titanium.' + apiName;
					} else {
						apiName = 'Ti.' + apiName;
					}

					if (apiName.lastIndexOf('.') === apiName.length - 1) {
						apiName = apiName.substr(0, apiName.length - 1);
						shortApiName = shortApiName.substr(0, shortApiName.length - 1);
					}
				}

				if ('iOS'.indexOf(attribute) === 0 || 'iPad'.indexOf(attribute) === 0) {
					shortApiName += '.' + attribute;
					attribute = null;
				}
				completions = [];

				if (!attribute || attribute.length === 0) {
					for (const key of Object.keys(titanium.types)) {
						if (key.indexOf(shortApiName) === 0 && key.indexOf('_') === -1) {
							completions.push({
								type: 'method',
								text: key.replace(/^Ti\./, nameSpace + '.'),
								api: nameSpace,
								replacementPrefix: Utils.getCustomPrefix(request)
							});
						}
					}
				}
				const apiObj = titanium.types[shortApiName];
				if (apiObj) {
					for (const func of apiObj.functions) {
						completions.push(autoCompleteHelper.suggestion({
							type: 'function',
							snippet: `${func.replace(/^Ti\./, nameSpace + '.')}(\${1})\${0}`,
							api: nameSpace,
							displayText: `${apiName}.${func}`
						}));
					}
					for (const prop of apiObj.properties) {
						completions.push(autoCompleteHelper.suggestion({
							type: 'properties',
							snippet: prop.replace(/^Ti\./, nameSpace + '.'),
							api: nameSpace,
							displayText: `${apiName}.${prop}`
						}));
					}
				}
			}

			return completions;
		}
	},

	{
		regExp: /Alloy\S+/,
		getCompletions(request) {
			let completions = [];
			let line = Utils.getLine(request);

			const regResult = line.match(/((?:Alloy)\.(?:(?:[A-Z]\w*)\.?)*)([a-z]\w*)*$/);
			if (regResult) {

				let apiName;
				let attribute;
				if (regResult && regResult.length === 3) {
					apiName = regResult[1];
					if (apiName.lastIndexOf('.') === apiName.length - 1) {
						apiName = apiName.substr(0, apiName.length - 1);
					}
					attribute = regResult[2];
				}

				if (!attribute || attribute.length === 0) {
					for (const key of Object.keys(alloy.types)) {
						if (key.indexOf(apiName) === 0 && key.indexOf('_') === -1) {
							completions.push({
								type: 'method',
								text: key,
								api: apiName,
								displayText: key,
								replacementPrefix: Utils.getCustomPrefix(request)
							});
						}
					}
				}
				const apiObj = alloy.types[apiName];
				if (apiObj) {
					for (const func of apiObj.functions) {
						completions.push(autoCompleteHelper.suggestion({
							type: 'function',
							snippet: `${func}(\${1})\${0}`,
							api: apiName,
							displayText: `${apiName}.${func}`
						}));
					}
					for (const prop of apiObj.properties) {
						completions.push(autoCompleteHelper.suggestion({
							type: 'properties',
							snippet: prop,
							api: apiName,
							displayText: `${apiName}.${prop}`
						}));
					}
				}
			}

			return completions;
		}
	},

	//
	// Property value
	// e.g. $.tableView.separatorStyle = Ti.UI.TABLE_VIEW_SEPARATOR_STYLE_NONE;
	//
	{
		regExp: /\$\.([-a-zA-Z0-9-_]*)\.([-a-zA-Z0-9-_/]*)\s*=\s*([-a-zA-Z0-9-_/]*)$/,
		getCompletions(request) {
			let completions;
			let line = Utils.getLine(request);

			let regResult = this.regExp.exec(line);
			if (regResult) {
				let idName = regResult[1];
				let propertyName = regResult[2];
				let textBuffer = Utils.getTextBuffer(related.getTargetPath('xml'));
				if (!textBuffer.isEmpty()) {
					completions = [];
					let curTagName = '';
					textBuffer.scan(new RegExp(`id=["']${idName}["']`, 'g'), function (item) {
						curTagName = viewAutoCompleteProvider.getPreviousTag(textBuffer, item.range.start);
						return item.stop();
					});

					if (curTagName && alloy.tags[curTagName]) {
						let { apiName } = alloy.tags[curTagName];
						const property = titanium.properties[propertyName];
						if (property && property.values) {
							for (const value of property.values) {
								completions.push(autoCompleteHelper.suggestion({
									type: 'value',
									text: value,
									apiName,
									property: propertyName
								}));
							}
						}
					}
				}
			}

			return completions;
		}
	},
	alloyAutoCompleteRules.i18n,
	alloyAutoCompleteRules.image,
	alloyAutoCompleteRules.cfg
];

export default {
	// This will work on JavaScript and CoffeeScript files, but not in js comments.
	selector: '.source.js, .source.coffee',
	disableForSelector: '.source.js .comment',
	filterSuggestions: true,
	inclusionPriority: 1,
	// excludeLowerPriority: true,
	suggestionPriority: 2,

	async loadCompletions() {

		const completions = await autoCompleteHelper.loadCompletions();

		titanium = completions.titanium;
		alloy = completions.alloy;
	},

	// Required: Return a promise, an array of suggestions, or null.
	async getSuggestions(request) {
		if (!Project.isTitaniumApp) {
			return;
		}
		let textBuffer;
		if (!alloy) {
			await this.loadCompletions();
		}
		let { editor, bufferPosition } = request;
		// return unless prefix?.length

		let completions = [];

		let line = editor.getTextInRange([ [ bufferPosition.row, 0 ], bufferPosition ]);

		//
		// Alloy ID - referenced from related view XML file
		// e.g. $.tableView
		//
		if (alloyIdNamePattern.test(line)) { // id name
			textBuffer = Utils.getTextBuffer(related.getTargetPath('xml'));
			if (!textBuffer.isEmpty()) {
				let fileName = textBuffer.getPath().split('/').pop();
				const ids = [];
				textBuffer.scan(/id="(.*?)"/g, item => {
					const id = item.match[1];
					if (id && id.length > 0 && !ids.includes(id)) {
						completions.push(autoCompleteHelper.suggestion({
							type: '#',
							text: item.match[1],
							description: `ID declared in ${fileName}`,
						}));
						ids.push(id);
					}
				});
			}

		//
		// Method and property name
		// e.g. $.tableView.setSeparatorStyle / $.tableView.separatorStyle
		//
		} else if (alloyIdMemberPattern.test(line)) {
			let idName = alloyIdMemberPattern.exec(line)[1];
			textBuffer = Utils.getTextBuffer(related.getTargetPath('xml'));

			if (!textBuffer.isEmpty()) {
				let curTagName = '';
				textBuffer.scan(new RegExp(`id=["']${idName}["']`, 'g'), function (item) {
					curTagName = viewAutoCompleteProvider.getPreviousTag(textBuffer, item.range.start);
					return item.stop();
				});
				if (curTagName && alloy.tags[curTagName]) {
					let { apiName } = alloy.tags[curTagName];
					let curTagObject = titanium.types[apiName];
					if (curTagObject) {
						for (const value of curTagObject.functions) {
							completions.push(autoCompleteHelper.suggestion({
								type: 'method',
								displayText: value,
								snippet: `${value}(\${1})\${0}`,
								api: apiName,
								property: value,
							}));
						}

						for (const value of curTagObject.properties) {
							completions.push(autoCompleteHelper.suggestion({
								type: 'property',
								displayText: value,
								snippet: `${value} = $1$0`,
								api: apiName,
								property: value,
							}));
						}
					}
				}
			}
		} else {
			for (const rule of customAlloyCompletionRules) {
				const ruleResult = rule.getCompletions(request);
				if (ruleResult && ruleResult.length > 0) {
					completions = ruleResult;
					break;
				}
			}
		}

		if (completions) {
			completions.sort(autoCompleteHelper.sort);
		}

		return completions;
	},

	isPropertyNameCompletion() { },

	// (optional): called _after_ the suggestion `replacementPrefix` is replaced
	// by the suggestion `text` in the buffer
	onDidInsertSuggestion({ editor, triggerPosition, suggestion }) {
		suggestion.onDidInsertSuggestion && suggestion.onDidInsertSuggestion({ editor, triggerPosition, suggestion });
		if (suggestion.type === 'property') {
			return setTimeout(autoCompleteHelper.triggerAutocomplete.bind(this, editor), 1);
		}
	},

	// (optional): called when your provider needs to be cleaned up. Unsubscribe
	// from things, kill any processes, etc.
	dispose() { },
};
