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
			let alloyRootPath = Utils.getAlloyRootPath();
			if (this.regExp.test(line)) {
				completions = [];
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
			let alloyRootPath = Utils.getAlloyRootPath();
			if (this.regExp.test(line)) {
				completions = [];
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
			let alloyRootPath = Utils.getAlloyRootPath();
			if (this.regExp.test(line)) {
				completions = [];
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
			let alloyRootPath = Utils.getAlloyRootPath();
			if (this.regExp.test(line)) {
				completions = [];
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

			let tiCompletions = require('./completions');
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

					if (curTagName && tiCompletions.tags[curTagName]) {
						let { apiName } = tiCompletions.tags[curTagName];
						let curTagObject = tiCompletions.types[apiName];
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

	//
	// Property value
	// e.g. $.tableView.separatorStyle = Ti.UI.TABLE_VIEW_SEPARATOR_STYLE_NONE;
	//
	{
		regExp: /\$\.([-a-zA-Z0-9-_]*)\.([-a-zA-Z0-9-_/]*)\s*=\s*([-a-zA-Z0-9-_/]*)$/,
		getCompletions(request) {
			let tiCompletions = require('./completions');
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

					if (curTagName && tiCompletions.tags[curTagName]) {
						let { apiName } = tiCompletions.tags[curTagName];
						const property = tiCompletions.properties[propertyName];
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
	completions: undefined,

	loadCompletions() {
		return this.completions = require('./completions');
	},
	// Required: Return a promise, an array of suggestions, or null.
	getSuggestions(request) {
		if (!Project.isTitaniumApp) {
			return;
		}
		let textBuffer;
		if (!this.completions) {
			this.loadCompletions();
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

				if (curTagName && this.completions.tags[curTagName]) {
					let { apiName } = this.completions.tags[curTagName];
					let curTagObject = this.completions.types[apiName];
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
			let ruleResult;
			for (const rule of customAlloyCompletionRules) {
				ruleResult = rule.getCompletions(request);
				if (ruleResult) {
					break;
				}
			}
			completions = ruleResult; // || this.getPropertyNameCompletions(request);
		}

		if (completions) {
			completions.sort(autoCompleteHelper.sort);
		}

		return new Promise(function (resolve) {
			return resolve(completions);
		});
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
