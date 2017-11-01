'use babel'

import fs from 'fs';
import _ from 'underscore';
import find from 'find';
import path from 'path';
import { parseString } from 'xml2js';
import Utils from '../utils';
import related from '../related';
import viewAutoCompleteProvider from './viewAutoCompleteProvider';
import alloyCompletionRules from './alloyCompletionRules';
import autoCompleteHelper from './autoCompleteHelper';

const tagRegExp = /(<([^>]+)>)/ig;
const propertyNamePrefixPattern = /\.([a-zA-Z]+[-a-zA-Z-_]*)$/;
const alloyIdNamePattern = /\$\.([-a-zA-Z0-9-_]*)$/;
const alloyIdMemberPattern = /\$\.([-a-zA-Z0-9-_]*).([-a-zA-Z0-9-_]*)$/;

customAlloyCompletionRules = [

	//
	// CommonJS require path - local modules in /app/lib
	// e.g. var bar = require('/foo');
	//
	{
		regExp: /require\(["']([-a-zA-Z0-9-_\/]*)$/,
		getCompletions(request) {
			let completions = undefined;
			let line = Utils.getLine(request);
			let alloyRootPath = Utils.getAlloyRootPath();
			if (this.regExp.test(line)) {
				completions = [];
				let libPath = path.join(alloyRootPath, 'lib');
				if (Utils.isExistAsDirectory(libPath)) {
					let files = find.fileSync(/\.js$/, libPath);
					for (let file of Array.from(files)) {
						let prefix = Utils.getCustomPrefix(request);
						let additionalPrefix = (prefix.startsWith('/') ? '' : '/');

						let value = '/' + file.replace(libPath + path.sep, '').split('.')[0];
						completions.push(autoCompleteHelper.suggestion({
							type: 'require',
							text: value,
							replacementPrefix: additionalPrefix + prefix,
							onDidInsertSuggestion({ editor, triggerPosition, suggestion }) {
								let targetRange = [
									[triggerPosition.row, 0],
									[triggerPosition.row, triggerPosition.column]
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
		regExp: /Alloy\.(createController|Controllers\.instance)\(["']([-a-zA-Z0-9-_\/]*)$/,
		getCompletions(request) {
			let completions = undefined;
			let line = Utils.getLine(request);
			let alloyRootPath = Utils.getAlloyRootPath();
			if (this.regExp.test(line)) {
				completions = [];
				let controllerPath = path.join(alloyRootPath, 'controllers');
				if (Utils.isExistAsDirectory(controllerPath)) {
					let files = find.fileSync(/\.js$/, controllerPath);
					for (let file of Array.from(files)) {
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
									[triggerPosition.row, 0],
									[triggerPosition.row, triggerPosition.column]
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
		regExp: /Alloy\.(createWidget|Widgets\.instance)\(["']([-a-zA-Z0-9-_\/\.]*)$/,
		getCompletions(request) {
			let completions = undefined;
			let line = Utils.getLine(request);
			let alloyRootPath = Utils.getAlloyRootPath();
			if (this.regExp.test(line)) {
				completions = [];
				let alloyConfigPath = path.join(alloyRootPath, 'config.json');
				try {
					let configObj = JSON.parse(fs.readFileSync(alloyConfigPath));
					for (let widgetName in (configObj != null ? configObj.dependencies : undefined)) {
						let value = (configObj != null ? configObj.dependencies : undefined)[widgetName];
						completions.push(autoCompleteHelper.suggestion({
							type: 'require',
							text: widgetName,
							replacementPrefix: Utils.getCustomPrefix(request)
						}));
					}
				} catch (error) { }
			}
			return completions;
		}
	},

	//
	// Alloy model / collection path
	// e.g. Alloy.createModel('foo');
	//
	{
		regExp: /Alloy\.(createModel|Models\.instance|createCollection|Collections\.instance)\(["']([-a-zA-Z0-9-_\/]*)$/,
		getCompletions(request) {
			let completions = undefined;
			let line = Utils.getLine(request);
			let alloyRootPath = Utils.getAlloyRootPath();
			if (this.regExp.test(line)) {
				completions = [];
				let controllerPath = path.join(alloyRootPath, 'models');
				if (Utils.isExistAsDirectory(controllerPath)) {
					let files = find.fileSync(/\.js$/, controllerPath);
					for (let file of Array.from(files)) {
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
		regExp: /\$\.([-a-zA-Z0-9-_]*)\.(add|remove)EventListener\(["']([-a-zA-Z0-9-_\/]*)$/,
		getCompletions(request) {
			let completions = undefined;
			let line = Utils.getLine(request);

			let tiCompletions = require('./completions');
			let regResult = this.regExp.exec(line);
			if (regResult) {
				let idName = regResult[1];
				let sourceEditor = Utils.getFileEditor(related.getTargetPath('xml'));

				if (!sourceEditor.isEmpty()) {
					completions = [];
					let curTagName = '';
					sourceEditor.scan(new RegExp(`id=[\"']${idName}[\"']`, 'g'), function (item) {
						curTagName = viewAutoCompleteProvider.getPreviousTag(sourceEditor, item.range.start);
						return item.stop();
					});

					if (curTagName && tiCompletions.tags[curTagName]) {
						let { apiName } = tiCompletions.tags[curTagName];
						let curTagObject = tiCompletions.types[apiName];
						_.each(curTagObject.events, value =>
							completions.push(autoCompleteHelper.suggestion({
								type: 'event',
								text: value,
								api: apiName,
								property: value
							}))
						);
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
		regExp: /\$\.([-a-zA-Z0-9-_]*)\.([-a-zA-Z0-9-_\/]*)\s*=\s*([-a-zA-Z0-9-_\/]*)$/,
		getCompletions(request) {
			let tiCompletions = require('./completions');
			let completions = undefined;
			let line = Utils.getLine(request);

			let regResult = this.regExp.exec(line);
			if (regResult) {
				let idName = regResult[1];
				let propertyName = regResult[2];
				let sourceEditor = Utils.getFileEditor(related.getTargetPath('xml'));
				if (!sourceEditor.isEmpty()) {
					completions = [];
					let curTagName = '';
					sourceEditor.scan(new RegExp(`id=[\"']${idName}[\"']`, 'g'), function (item) {
						curTagName = viewAutoCompleteProvider.getPreviousTag(sourceEditor, item.range.start);
						return item.stop();
					});


					if (curTagName && tiCompletions.tags[curTagName]) {
						let { apiName } = tiCompletions.tags[curTagName];
						let curTagObject = tiCompletions.types[apiName];

						_.each(tiCompletions.properties[propertyName] != null ? tiCompletions.properties[propertyName].values : undefined, function (value) {
							let iconHTML;
							let valueInfo = value.split('|');
							const deprecated = (valueInfo[1] === 'deprecated');
							return completions.push(autoCompleteHelper.suggestion({
								type: 'value',
								text: valueInfo[0],
								apiName,
								property: propertyName,
								deprecated
							}));
						});
					}
				}
			}

			return completions;
		}
	},
	alloyCompletionRules.i18n,
	alloyCompletionRules.image,
	alloyCompletionRules.cfg
];

export default {
	// This will work on JavaScript and CoffeeScript files, but not in js comments.
	selector: '.source.js, .source.coffee',
	disableForSelector: '.source.js .comment',
	filterSuggestions: true,

	// This will take priority over the default provider, which has a priority of 0.
	// `excludeLowerPriority` will suppress any providers with a lower priority
	// i.e. The default provider will be suppressed
	inclusionPriority: 1,
	excludeLowerPriority: true,
	suggestionPriority: 2,
	completions: undefined,

	loadCompletions() {
		return this.completions = require('./completions');
	},
	// Required: Return a promise, an array of suggestions, or null.
	getSuggestions(request) {
		let sourceEditor;
		if (!this.completions) {
			this.loadCompletions();
		}
		let { editor, bufferPosition, scopeDescriptor, prefix } = request;
		// return unless prefix?.length

		let completions = [];

		let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);


		//
		// Alloy ID - referenced from related view XML file
		// e.g. $.tableView
		//
		if (alloyIdNamePattern.test(line)) { // id name
			sourceEditor = Utils.getFileEditor(related.getTargetPath('xml'));
			if (!sourceEditor.isEmpty()) {
				let fileName = _.last(sourceEditor.getPath().split('/'));
				sourceEditor.scan(/id="(.*?)"/g, item => {
					completions.push(autoCompleteHelper.suggestion({
						type: '#',
						text: item.match[1],
						description: `ID declared in ${fileName}`,
					}))
				});
			}

			//
			// Method and property name
			// e.g. $.tableView.setSeparatorStyle / $.tableView.separatorStyle
			//
		} else if (alloyIdMemberPattern.test(line)) {
			let idName = alloyIdMemberPattern.exec(line)[1];
			sourceEditor = Utils.getFileEditor(related.getTargetPath('xml'));

			if (!sourceEditor.isEmpty()) {
				let curTagName = '';
				sourceEditor.scan(new RegExp(`id=[\"']${idName}[\"']`, 'g'), function (item) {
					curTagName = viewAutoCompleteProvider.getPreviousTag(sourceEditor, item.range.start);
					return item.stop();
				});

				if (curTagName && this.completions.tags[curTagName]) {
					let { apiName } = this.completions.tags[curTagName];
					let curTagObject = this.completions.types[apiName];
					if (curTagObject) {
						_.each(curTagObject.functions, value =>
							completions.push(autoCompleteHelper.suggestion({
								type: 'method',
								displayText: value,
								snippet: `${value}(\${1})\${0}`,
								api: apiName,
								property: value,
							}))
						);

						_.each(curTagObject.properties, value =>
							completions.push(autoCompleteHelper.suggestion({
								type: 'property',
								displayText: value,
								snippet: `${value} = $1$0`,
								api: apiName,
								property: value,
							}))
						);
					}
				}
			}
		} else {
			let ruleResult;
			for (let rule of Array.from(customAlloyCompletionRules)) {
				ruleResult = rule.getCompletions(request);
				if (ruleResult) { break; }
			}
			completions = ruleResult;// || this.getPropertyNameCompletions(request);
		}

		if (completions != null) {
			completions.sort(autoCompleteHelper.sort);
		}

		return new Promise(function (resolve) {
			return resolve(completions);
		});
	},

	isPropertyNameCompletion() { },


	getPropertyNamePrefix(bufferPosition, editor) {
		let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
		return Utils.__guard__(propertyNamePrefixPattern.exec(line), x => x[1]);
	},


	// getPropertyNameCompletions({bufferPosition, editor, scopeDescriptor, activatedManually}, candidateProperties) {
	//   // Don't autocomplete property names in SASS on root level
	//   let scopes = scopeDescriptor.getScopesArray();
	//   let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
	//   // return [] if hasScope(scopes, 'source.sass') and not line.match(/^(\s|\t)/)

	//   let prefix = this.getPropertyNamePrefix(bufferPosition, editor);
	//   if (!activatedManually && !prefix) { return null; }

	//   let completions = [];
	//   candidateProperties = candidateProperties || this.completions.properties;
	//   for (let property in candidateProperties) {
	//     // jsObjectTypes = ['Font']
	//     // if jsObjectTypes.indexOf(@properties[property].type) > -1
	//     //   completions.push
	//     //     type: 'property'
	//     //     snippet: "#{property}: {\n\t\${1}\t\n}"
	//     //     displayText: property
	//     //     description: options.description
	//     // else  
	//     let options = candidateProperties[property];
	//     if (!prefix || Utils.firstCharsEqual(property, prefix)) {
	//       completions.push({
	//         type: '?',
	//         text: property,
	//         // displayText: property,
	//         replacementPrefix: prefix,
	//         description: options.description,
	//         // descriptionMoreURL: "#{cssDocsURL}/#{propertyName}"
	//         priority: 2
	//       });
	//     }
	//   }

	//   return completions;
	// },

	// (optional): called _after_ the suggestion `replacementPrefix` is replaced
	// by the suggestion `text` in the buffer
	onDidInsertSuggestion({ editor, triggerPosition, suggestion }) {
		suggestion.onDidInsertSuggestion && suggestion.onDidInsertSuggestion({ editor, triggerPosition, suggestion });
		if (suggestion.type === 'property') { return setTimeout(autoCompleteHelper.triggerAutocomplete.bind(this, editor), 1); }
	},

	// (optional): called when your provider needs to be cleaned up. Unsubscribe
	// from things, kill any processes, etc.
	dispose() { },
};
