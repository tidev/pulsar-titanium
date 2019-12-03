'use babel';

import _ from 'underscore';
import Utils from '../utils';
import related from '../related';
import Project from '../project';
import alloyAutoCompleteRules from './alloyAutoCompleteRules';
import autoCompleteHelper from './autoCompleteHelper';

const propertyNameWithColonPattern = /^\s*(\S+)\s*:/;
const objectNameWithColonPattern = /^\s*(\S+)\s*:\s*\{/;
const propertyNamePrefixPattern = /[a-zA-Z]+[-a-zA-Z]*$/;
const tagSelectorPrefixPattern = /["']([A-Za-z]+)?$/;

export default {
	selector: '.source.css.tss',
	// disableForSelector: '.source.css.tss .comment, .source.css.tss .string'

	filterSuggestions: true,
	inclusionPriority: 1,
	excludeLowerPriority: true,
	suggestionPriority: 2,

	async getSuggestions(request) {
		if (!Project.isTitaniumApp) {
			return;
		}
		let textBuffer;
		if (!this.tags) {
			await this.loadCompletions();
		}

		let completions = [];
		let fileName;
		// const scopes = request.scopeDescriptor.getScopesArray();

		// for key & value

		if (this.isCompletingValue(request)) {
			for (const rule of Object.values(alloyAutoCompleteRules)) {
				const ruleResult = rule.getCompletions(request);
				if (ruleResult && ruleResult.length > 0) {
					completions = ruleResult;
					break;
				}
			}
			if (!completions.length) {
				completions = this.getPropertyValueCompletions(request);
			}
		} else if (this.isCompletingName(request)) {
			completions = this.getPropertyNameCompletions(request);

		//
		// Class name - from related view
		//
		} else if (this.isCompletingClassName(request)) {
			// find class names from view(xml)
			// filter using request.prefix
			textBuffer = Utils.getTextBuffer(related.getTargetPath('xml'));
			if (!textBuffer.isEmpty()) {
				fileName = textBuffer.getPath().split('/').pop();
				const classNames = [];
				textBuffer.scan(/class="(.*?)"/g, item => {
					for (const className of item.match[1].split(' ')) {
						if (className && className.length > 0 && !classNames.includes(className)) {
							completions.push(autoCompleteHelper.suggestion({
								type: '.',
								text: className,
								description: `class declared in ${fileName}`
							}));
							classNames.push(className);
						}
					}
				});
			}

		//
		// ID - from related view
		//
		} else if (this.isCompletingIdName(request)) {
			textBuffer = Utils.getTextBuffer(related.getTargetPath('xml'));
			if (!textBuffer.isEmpty()) {
				fileName = textBuffer.getPath().split('/').pop();
				const ids = [];
				textBuffer.scan(/id="(.*?)"/g, item => {
					const id = item.match[1];
					if (id && id.length > 0 && !ids.includes(id)) {
						completions.push(autoCompleteHelper.suggestion({
							type: '#',
							text: id,
							description: `ID declared in ${fileName}`
						}));
						ids.push(id);
					}
				});
			}

		} else if (this.isCompletingTagSelector(request)) {
			const tagCompletions = this.getTagCompletions(request);
			if (tagCompletions ? tagCompletions.length : undefined) {
				completions = completions.concat(tagCompletions);
			}
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

	async loadCompletions() {

		const completions = await autoCompleteHelper.loadCompletions();

		this.properties = completions.titanium.properties;
		this.types = completions.titanium.types;
		this.tags = completions.alloy.tags;
	},

	isCompletingClassName({ bufferPosition, editor }) {
		const previousBufferPosition = [ bufferPosition.row, Math.max(0, bufferPosition.column - 1) ];
		const previousScopes = editor.scopeDescriptorForBufferPosition(previousBufferPosition);
		const previousScopesArray = previousScopes.getScopesArray();

		return (hasScope(previousScopesArray, 'entity.other.attribute-name.class.css.tss'));
	},

	isCompletingIdName({ bufferPosition, editor }) {
		const previousBufferPosition = [ bufferPosition.row, Math.max(0, bufferPosition.column - 1) ];
		const previousScopes = editor.scopeDescriptorForBufferPosition(previousBufferPosition);
		const previousScopesArray = previousScopes.getScopesArray();

		return (hasScope(previousScopesArray, 'entity.other.attribute-name.id.css.tss'));
	},

	isCompletingValue({ scopeDescriptor }) {
		const scopes = scopeDescriptor.getScopesArray();

		// const previousBufferPosition = [ bufferPosition.row, Math.max(0, bufferPosition.column - prefix.length - 1) ];
		// const previousScopes = editor.scopeDescriptorForBufferPosition(previousBufferPosition);
		// const previousScopesArray = previousScopes.getScopesArray();

		const lastValueScopeIndex = scopes.lastIndexOf('meta.property-value.css.tss');
		const lastListScopeIndex = scopes.lastIndexOf('meta.property-list.css.tss');

		return (hasScope(scopes, 'meta.property-value.css.tss') && !hasScope(scopes, 'punctuation.terminator.rule.css.tss')) && (lastListScopeIndex < lastValueScopeIndex);
	},

	isCompletingName({ scopeDescriptor, bufferPosition, prefix, editor }) {
		let isAtBeginScopePunctuation;
		const scopes = scopeDescriptor.getScopesArray();

		// const lineLength = editor.lineTextForBufferRow(bufferPosition.row).length;
		const isAtTerminator = prefix.endsWith(',');
		// isAtParentSymbol = prefix.endsWith('&')
		const isInPropertyList = !isAtTerminator && hasScope(scopes, 'meta.property-list.css.tss');

		if (!isInPropertyList) {
			return false;
		}
		// return false if isAtParentSymbol

		const previousBufferPosition = [ bufferPosition.row, Math.max(0, bufferPosition.column - prefix.length - 1) ];
		const previousScopes = editor.scopeDescriptorForBufferPosition(previousBufferPosition);
		const previousScopesArray = previousScopes.getScopesArray();

		if (hasScope(previousScopesArray, 'entity.other.attribute-name.class.css.tss')
			|| hasScope(previousScopesArray, 'entity.other.attribute-name.id.css.tss')
			|| (isAtBeginScopePunctuation = hasScope(scopes, 'punctuation.section.property-list.begin.css'))) {
			return false;
		}

		const isAtEndScopePunctuation = hasScope(scopes, 'punctuation.section.property-list.end.css');

		if (isAtBeginScopePunctuation) {
			return prefix.endsWith('{');
		} else if (isAtEndScopePunctuation) {
			return !prefix.endsWith('}');
		} else {
			return true;
		}
	},

	isCompletingNameOrTag({ scopeDescriptor, bufferPosition, editor }) {
		const scopes = scopeDescriptor.getScopesArray();
		const prefix = this.getPropertyNamePrefix(bufferPosition, editor);
		return this.isPropertyNamePrefix(prefix)
				&& hasScope(scopes, 'meta.selector.css')
				&& !hasScope(scopes, 'entity.other.attribute-name.id.css.sass')
				&& !hasScope(scopes, 'entity.other.attribute-name.class.sass');
	},

	isCompletingTagSelector({ editor, scopeDescriptor, bufferPosition }) {
		const scopes = scopeDescriptor.getScopesArray();
		const tagSelectorPrefix = this.getTagSelectorPrefix(editor, bufferPosition);
		if (!(tagSelectorPrefix ? tagSelectorPrefix.length : undefined)) {
			return false;
		}
		if (hasScope(scopes, 'meta.selector.css.tss')) {
			return true;
		} else {
			return false;
		}
	},

	isPropertyValuePrefix(prefix) {
		prefix = prefix.trim();
		return (prefix.length > 0) && (prefix !== ':');
	},

	isPropertyNamePrefix(prefix) {
		if (!prefix) {
			return false;
		}
		prefix = prefix.trim();
		return (prefix.length > 0) && prefix.match(/^[a-zA-Z-]+$/);
	},

	getParentObjectName(bufferPosition, editor) {
		let { row } = bufferPosition;
		while (row >= 0) {
			const line = editor.lineTextForBufferRow(row);
			const regexResult = objectNameWithColonPattern.exec(line);
			const propertyName = regexResult ? regexResult[1] : undefined;

			const parentNameIndex = (regexResult ? regexResult.index : undefined) || -1;
			if (parentNameIndex < line.lastIndexOf('}')) {
				return;
			}
			if (propertyName) {
				return propertyName;
			}
			row--;
		}
	},

	getPreviousPropertyName(bufferPosition, editor) {
		let { row } = bufferPosition;
		while (row >= 0) {
			const line = editor.lineTextForBufferRow(row);
			const matches = propertyNameWithColonPattern.exec(line);
			if (matches && matches.length >= 2) {
				return matches[1];
			}
			row--;
		}
	},

	getPropertyValueCompletions(request) {
		let { bufferPosition, editor, prefix } = request;
		const property = this.getPreviousPropertyName(bufferPosition, editor);
		// const parentPropertyName = this.getParentObjectName(bufferPosition, editor);

		if (!this.properties[property]) {
			return null;
		}

		const { values } = this.properties[property];

		if (!values) {
			return null;
		}

		const completions = [];
		if (this.isPropertyValuePrefix(prefix)) {
			for (let value of values) {
				if (Utils.firstCharsEqual(value, prefix)) {
					const line = editor.getTextInRange([ [ bufferPosition.row, bufferPosition.row - 1 ], bufferPosition ]);
					if (/["']/.test(line)) {
						value = value.replace(/["']/g, '');
					}
					if (/["']/.test(value)) {
						completions.push(this.buildPropertyValueCompletionWithQuotes(value, property, prefix));

					} else {
						completions.push(this.buildPropertyValueCompletion(value, property));
					}
				}
			}
		} else {
			for (let value of values) {
				if (/["']/.test(value)) {
					const line = editor.getTextInRange([ [ bufferPosition.row, bufferPosition.row - 1 ], bufferPosition ]);
					if (/["']/.test(line)) {
						value = value.replace(/["']/g, '');
					}
				}
				completions.push(this.buildPropertyValueCompletion(value, property));
			}
		}

		return completions;
	},

	//
	// Property value completion
	//

	buildPropertyValueCompletion(value, property) {
		const properties = {
			type: 'value',
			text: value,
			property
		};
		return autoCompleteHelper.suggestion(properties);
	},

	buildPropertyValueCompletionWithQuotes(value, property, prefix) {
		const properties = {
			type: 'value',
			text: value,
			replacementPrefix: `'${prefix}`,
			property,
			onDidInsertSuggestion({ editor, triggerPosition, suggestion }) {
				const targetRange = [ [ triggerPosition.row, 0 ], [ triggerPosition.row, triggerPosition.column ] ];
				const originText = editor.getTextInRange(targetRange);
				if (!(new RegExp(`${suggestion.replacementPrefix}$`)).test(originText)) {
					return editor.setTextInBufferRange(targetRange, originText.replace(new RegExp(`${prefix}$`), `${value}`));
				}
			}
		};
		return autoCompleteHelper.suggestion(properties);
	},

	getPropertyNamePrefix(bufferPosition, editor) {
		const line = editor.getTextInRange([ [ bufferPosition.row, 0 ], bufferPosition ]);
		const matches = propertyNamePrefixPattern.exec(line);
		if (matches && matches.length > 0) {
			return matches[0];
		}
	},

	//
	// Property name completions
	//
	//
	getPropertyNameCompletions({ bufferPosition, editor, scopeDescriptor, activatedManually }) {
		const scopes = scopeDescriptor.getScopesArray();
		const line = editor.getTextInRange([ [ bufferPosition.row, 0 ], bufferPosition ]);
		if (hasScope(scopes, 'source.sass') && !line.match(/^(\s|\t)/)) {
			return [];
		}

		const prefix = this.getPropertyNamePrefix(bufferPosition, editor);
		if (!activatedManually && !prefix) {
			return null;
		}

		const parentObjName = this.getParentObjectName(bufferPosition, editor);

		const innerProperties = {};
		const type = this.types[this.properties[parentObjName] ? this.properties[parentObjName].type : undefined];

		if (type && (this.properties[parentObjName] ? this.properties[parentObjName].type : undefined) && type.properties && type.properties.length) {
			_.each(this.types[this.properties[parentObjName] ? this.properties[parentObjName].type : undefined].properties, innerKey => innerProperties[innerKey] = {});
		}

		const completions = [];
		const candidateProperties = _.isEmpty(innerProperties) ? this.properties : innerProperties;
		for (let property in candidateProperties) {
			// const options = candidateProperties[property];
			if (!prefix || Utils.firstCharsEqual(property, prefix)) {

				//
				// Object types
				//
				const jsObjectTypes = [ 'Font' ];
				if (jsObjectTypes.indexOf(this.properties[property].type) > -1) {
					completions.push(autoCompleteHelper.suggestion({
						type: 'property',
						snippet: `${property}: {\n\t\${1}\t\n}`,
						displayText: property
					}));

				//
				// Value types
				//
				} else {
					completions.push(autoCompleteHelper.suggestion({
						type: 'property',
						snippet: `${property}: `,
						displayText: property,
						replacementPrefix: prefix,
						property
					}));
				}
			}
		}
		return completions;
	},

	getTagSelectorPrefix(editor, bufferPosition) {
		const line = editor.getTextInRange([ [ bufferPosition.row, 0 ], bufferPosition ]);
		const matches = tagSelectorPrefixPattern.exec(line);
		if (matches && matches.length >= 2) {
			return matches[1];
		}
	},

	//
	// Tag completion
	// e.g. "Window"
	//
	getTagCompletions({ prefix }) {
		const completions = [];
		if (prefix) {
			_.each(this.tags, function (value, key) {
				if (Utils.firstCharsEqual(key, prefix)) {
					return completions.push(autoCompleteHelper.suggestion({
						type: 'tag',
						text: key,
						api: value.apiName
					}));
				}
			});
		}
		return completions;
	}
};

var hasScope = (scopesArray, scope) => scopesArray.indexOf(scope) !== -1;
