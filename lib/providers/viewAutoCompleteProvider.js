'use babel';

import fs from 'fs';
import path from 'path';
import _ from 'underscore';
import Utils from '../utils';
import related from '../related';
import Project from '../project';
import find from 'find';
import alloyAutoCompleteRules from './alloyAutoCompleteRules';
import autoCompleteHelper from './autoCompleteHelper';

let trailingWhitespace = /\s$/;
let attributePattern = /\s+([a-zA-Z][-a-zA-Z]*)\s*=\s*$/;
let tagPattern = /<([a-zA-Z][-a-zA-Z]*)(?:\s|$)/;

export default {
	selector: '.text.alloyxml, .text.xml',
	disableForSelector: 'text.alloyxml .comment',
	filterSuggestions: true,
	inclusionPriority: 1,
	excludeLowerPriority: true,
	suggestionPriority: 2,

	getSuggestions(request) {
		if (!Project.isTitaniumApp) {
			return;
		}
		if (!this.completions) {
			this.loadCompletions();
		}
		let scopes = request.scopeDescriptor.getScopesArray();
		let completions = [];
		// if xml start with <Alloy, change grammars to text.alloyxml
		if (scopes.indexOf('text.xml') !== -1) {
			let { editor } = request;
			let lineCnt = editor.getLineCount();
			for (let i = 0, end = lineCnt; i < end; i++) {
				if (editor.lineTextForBufferRow(i).indexOf('<Alloy') !== -1) {
					editor.setGrammar(atom.grammars.grammarForScopeName('text.alloyxml'));
					break;
				}
			}
		}

		// attribute value: <ImageView image="_"
		if (this.isAttributeValue(request)) {
			let ruleResult;
			// first attempt Alloy rules (i18n, image etc.)
			_.find(alloyAutoCompleteRules, rule => ruleResult = rule.getCompletions(request));
			if (ruleResult) {
				completions = ruleResult;
			} else {
				// no results, try related values (ID, class, src) or API completions
				completions = this.getAttributeValueCompletions(request);
			}
		// attribute, no prefix: <View _
		} else if (this.isAttributeStartWithNoPrefix(request)) {
			completions = this.getAttributeNameCompletions(request);
		// attribute, with prefix: <View backgr_
		} else if (this.isAttributeStartWithPrefix(request)) {
			completions = this.getAttributeNameCompletions(request);
		// tag, no prefix: <_
		} else if (this.isTagStartWithNoPrefix(request)) {
			completions = this.getTagNameCompletions(request);
		// tag, with prefix: <Vi_
		} else if (this.isTagStartTagWithPrefix(request)) {
			completions = this.getTagNameCompletions(request);
		}

		if (completions) {
			completions.sort(autoCompleteHelper.sort);
		}
		return completions;
	},

	onDidInsertSuggestion({ editor, triggerPosition, suggestion }) {
		suggestion.onDidInsertSuggestion && suggestion.onDidInsertSuggestion({ editor, triggerPosition, suggestion });
		if (suggestion.type === 'property') {
			return setTimeout(autoCompleteHelper.triggerAutocomplete.bind(this, editor), 1);
		}
	},

	isOutsideOfTag({ scopeDescriptor, editor, bufferPosition }) {
		let scopes = scopeDescriptor.getScopesArray();
		if (scopes.length === 1) {
			let previoudChar = editor.getTextInRange([ [ bufferPosition.row, bufferPosition.column - 1 ], bufferPosition ]);
			return (scopes[0] === 'text.alloyxml') && (previoudChar !== '<');
		} else {
			return false;
		}
	},

	isTagStartWithNoPrefix({ prefix, scopeDescriptor }) {
		let scopes = scopeDescriptor.getScopesArray();
		if ((prefix === '<') && (scopes.length === 1)) {
			return scopes[0] === 'text.alloyxml';
		} else if ((prefix === '<') && (scopes.length === 2)) {
			return (scopes[0] === 'text.alloyxml') && (scopes[1] === 'meta.scope.outside-tag.html');
		} else {
			return false;
		}
	},

	isTagStartTagWithPrefix({ prefix, scopeDescriptor }) {
		if (!prefix) {
			return false;
		}
		if (trailingWhitespace.test(prefix)) {
			return false;
		}
		return this.hasTagScope(scopeDescriptor.getScopesArray());
	},

	isAttributeStartWithNoPrefix({ prefix, scopeDescriptor }) {
		if (!trailingWhitespace.test(prefix)) {
			return false;
		}
		return this.hasTagScope(scopeDescriptor.getScopesArray());
	},

	isAttributeStartWithPrefix({ prefix, scopeDescriptor, bufferPosition, editor }) {
		if (!prefix) {
			return false;
		}
		if (trailingWhitespace.test(prefix)) {
			return false;
		}

		let scopes = scopeDescriptor.getScopesArray();
		if (scopes.indexOf('entity.other.attribute-name.html') !== -1) {
			return true;
		}

		let previousBufferPosition = [ bufferPosition.row, Math.max(0, bufferPosition.column - 1) ];
		let previousScopes = editor.scopeDescriptorForBufferPosition(previousBufferPosition);
		let previousScopesArray = previousScopes.getScopesArray();
		if (previousScopesArray.indexOf('entity.other.attribute-name.html') !== -1) {
			return true;
		}

		if (!this.hasTagScope(scopes)) {
			return false;
		}

		return (scopes.indexOf('punctuation.definition.tag.html') !== -1)
				|| (scopes.indexOf('punctuation.definition.tag.end.html') !== -1);
	},

	isAttributeValue({ scopeDescriptor }) {
		let scopes = scopeDescriptor.getScopesArray();
		return this.hasStringScope(scopes) && this.hasTagScope(scopes);
	},

	hasTagScope(scopes) {
		return (scopes.indexOf('meta.tag.any.html') !== -1)
				|| (scopes.indexOf('meta.tag.other.html') !== -1)
				|| (scopes.indexOf('meta.tag.block.any.html') !== -1)
				|| (scopes.indexOf('meta.tag.inline.any.html') !== -1)
				|| (scopes.indexOf('meta.tag.structure.any.html') !== -1);
	},

	hasStringScope(scopes) {
		return (scopes.indexOf('string.quoted.double.html') !== -1)
				|| (scopes.indexOf('string.quoted.single.html') !== -1);
	},

	getTagNameCompletions({ prefix, editor, bufferPosition }) {

		// ensure prefix contains valid characters
		if (!/^[a-zA-Z]+$/.test(prefix)) {
			return [];
		}

		let completions = [];

		// Get the text for the line up to the triggered buffer position
		let line = editor.getTextInRange([ [ bufferPosition.row, 0 ], bufferPosition ]);

		let isClosing = new RegExp(`</${prefix}$`).test(line);
		for (let tag in this.completions.tags) {
			if (!prefix || Utils.firstCharsEqual(tag, prefix)) {
				completions.push(
					isClosing
						? this.buildCloseTagCompletion(tag, this.completions.tags[tag])
						: this.buildTagCompletion(tag, this.completions.tags[tag])
				);
			}
		}
		return completions;
	},

	//
	// Tag completion
	// e.g. <Window>
	//
	buildTagCompletion(tag, tagObj) {
		return autoCompleteHelper.suggestion({
			type: 'tag',
			snippet: `${tag}$1>$2</${tag}>`,
			displayText: tag,
			api: tagObj.apiName
		});
	},

	//
	// Closing tag completion
	// e.g. </Window>
	//
	buildCloseTagCompletion(tag, tagObj) {
		return autoCompleteHelper.suggestion({
			type: 'tag',
			snippet: `${tag}>`,
			displayText: tag,
			api: tagObj.apiName
		});
	},

	//
	// XML attribute completion - class properties and events
	// e.g. <Window backgroundColor / <Window onOpen
	//
	// note: current behaviour matches prefix first letter only and returns ALL matches,
	// 		 Atom restricts results set
	//
	getAttributeNameCompletions({ editor, bufferPosition, prefix }) {
		let completions = [];
		let tagName = this.getPreviousTag(editor.getBuffer(), bufferPosition);
		let tagAttributes = this.getTagAttributes(tagName).concat([ 'id', 'class', 'platform', 'bindId' ]);
		let apiName = tagName;
		if (this.completions.tags[tagName] && this.completions.tags[tagName].apiName) {
			apiName = this.completions.tags[tagName].apiName;
		}
		let events = [];
		if (this.completions.types[apiName]) {
			events = this.completions.types[apiName].events;
		}

		//
		// Class properties
		//
		for (const attribute of tagAttributes) {
			if (!prefix || Utils.firstCharsEqual(attribute, prefix)) {
				completions.push(autoCompleteHelper.suggestion({
					type: 'property',
					snippet: `${attribute}="$1"$0`,
					displayText: attribute,
					api: apiName,
					property: attribute,
				}));
			}
		}

		//
		// Event names - matches 'on' + event name
		//
		for (const event of events) {
			const attribute = `on${Utils.capitalizeFirstLetter(event)}`;
			if (!prefix || Utils.firstCharsEqual(attribute, prefix)) {
				completions.push(autoCompleteHelper.suggestion({
					type: 'event',
					snippet: `${attribute}="$1"$0`,
					displayText: attribute,
					api: apiName,
					property: event,
				}));
			}
		}

		return completions;
	},

	//
	// XML attribute value completions - ID and class from related TSS, Require and Widget src completion
	// e.g. <Window id="myWindow"> / <Require src="myController" /> / <Widget src="myWidget" />
	//
	getAttributeValueCompletions({ editor, bufferPosition }) {
		let prefix = Utils.getCustomPrefix({ bufferPosition, editor });
		let values;
		let tag = this.getPreviousTag(editor.getBuffer(), bufferPosition);
		let attribute = this.getPreviousAttribute(editor, bufferPosition);
		let currentPath = editor.getPath();
		// let currentControllerName = path.basename(currentPath, path.extname(currentPath));
		let completions = [];

		//
		// realted TSS file
		//
		if ((attribute === 'id') || (attribute === 'class')) {
			let fileName;
			let textBuffer = Utils.getTextBuffer(related.getTargetPath('tss', currentPath));
			if (!textBuffer.isEmpty()) {
				values = this.tokenTextForSelector(textBuffer, attribute);
				fileName = textBuffer.getPath().split('/').pop();
				for (const value of values) {
					if (!prefix || Utils.firstCharsEqual(value, prefix)) {
						completions.push(this.buildStyleSelectorCompletion(attribute, value, fileName));
					}
				}
			}

			//
			// app.tss file
			//
			textBuffer = Utils.getTextBuffer(path.join(atom.project.getPaths()[0], 'app', 'styles', 'app.tss'));
			if (!textBuffer.isEmpty()) {
				values = this.tokenTextForSelector(textBuffer, attribute);
				fileName = textBuffer.getPath().split('/').pop();
				for (const value of values) {
					if (!prefix || Utils.firstCharsEqual(value, prefix)) {
						completions.push(this.buildStyleSelectorCompletion(attribute, value, fileName));
					}
				}
			}

		} else if (attribute === 'src') {
			let alloyRootPath = Utils.getAlloyRootPath();

			//
			// Require src attribute
			//
			if (tag === 'Require') {
				let controllerPath = path.join(alloyRootPath, 'controllers');
				if (Utils.directoryExists(controllerPath)) {
					let files = find.fileSync(/\.js$/, controllerPath);
					for (const file of files) {
						if (currentPath !== file) { // exclude current controller
							let prefix = Utils.getCustomPrefix({ bufferPosition, editor });
							let additionalPrefix = (prefix.startsWith('/') ? '' : '/');
							let value = Utils.toUnixPath(file.replace(controllerPath, '').split('.')[0]);
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

			//
			// Widget src attribute
			//
			} else if (tag === 'Widget') {
				if (alloyRootPath) {
					let alloyConfigPath = path.join(alloyRootPath, 'config.json');
					try {
						let configObj = JSON.parse(fs.readFileSync(alloyConfigPath));
						for (let widgetName in (configObj ? configObj.dependencies : undefined)) {
							completions.push(autoCompleteHelper.suggestion({
								type: 'require',
								text: widgetName,
								replacementPrefix: Utils.getCustomPrefix({ bufferPosition, editor })
							}));
						}
					} catch (e) {
						return [];
					}
				}
			}

			//
			// Attribute values for prefix
			//
		} else {
			values = this.getAttributeValues(attribute);
			for (let value of values) {
				value = value.replace(/["']/g, '');
				if (!prefix || Utils.firstCharsEqual(value, prefix)) {
					completions.push(this.buildAttributeValueCompletion(tag, attribute, value));
				}
			}
		}

		return completions;
	},

	buildStyleSelectorCompletion(attribute, value, fileName) {
		return autoCompleteHelper.suggestion({
			type: (attribute === 'id') ? '#' : '.',
			text: value,
			description: `${attribute === 'id' ? 'ID' : 'class'} defined in ${fileName}`
		});
	},

	buildAttributeValueCompletion(tag, attribute, value) {
		return autoCompleteHelper.suggestion({
			type: 'value',
			text: value,
			property: attribute
		});
	},

	loadCompletions() {
		this.completions = require('./completions');
		return _.extend(this.completions.properties, {
			id: {
				description: 'TSS id'
			},
			class: {
				description: 'TSS class'
			},
			platform: {
				type: 'String',
				description: 'Platform condition',
				values: [
					'android',
					'ios',
					'mobileweb',
					'windows'
				]
			}
		});
	},

	getPreviousTag(textBuffer, bufferPosition) {
		let { row } = bufferPosition;
		while (row >= 0) {
			const matches = tagPattern.exec(textBuffer.lineForRow(row));
			if (matches && matches.length >= 2) {
				return matches[1];
			}
			row--;
		}
	},

	getPreviousAttribute(editor, bufferPosition) {
		let line = editor.getTextInRange([ [ bufferPosition.row, 0 ], bufferPosition ]).trim();

		// Remove everything until the opening quote
		let quoteIndex = line.length - 1;
		while (line[quoteIndex] && !([ '"', '\'' ].includes(line[quoteIndex]))) {
			quoteIndex--;
		}
		line = line.substring(0, quoteIndex);
		const matches = attributePattern.exec(line);
		if (matches && matches.length >= 2) {
			return matches[1];
		}
	},

	getAttributeValues(attribute) {
		attribute = this.completions.properties[attribute];
		return (attribute ? attribute.values : undefined)  ? (attribute  ? attribute.values : undefined) : [];
	},

	getTagAttributes(tag) {
		const type = this.completions.types[this.completions.tags[tag] ? this.completions.tags[tag].apiName : undefined];
		if (type) {
			return type.properties;
		}
		return [];
	},

	tokenTextForSelector(textBuffer, selectorType) {
		let matchingTokens = [];
		let regex = (selectorType === 'id') ? /["'](#)([a-z0-9_]+)[[\]=a-z0-9_]*["']\s*:\s*{/ig : /["'](\.)([a-z0-9_]+)[[\]=a-z0-9_]*["']\s*:\s*{/ig;
		textBuffer.scan(regex, item => matchingTokens.push(item.match[2].split('[')[0]));
		return matchingTokens;
	}
};
