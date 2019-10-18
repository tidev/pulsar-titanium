'use babel';

import Appc from '../appc';
import { completion } from 'titanium-editor-commons';
import Project from '../project';

export default {
	/**
	 * Sort completions
	 * - by priority
	 * - alphabetically
	 *
	 * @param {Object} a 	suggestion object
	 * @param {Object} b 	suggestion object
	 *
	 * @returns {Number}
	 */
	sort(a, b) {
		if (a.priority && b.priority && a.priority !== b.priority) {
			return b.priority - a.priority;
		} else {
			let aStr = a.text || a.displayText || a.snippet || '';
			let bStr = b.text || b.displayText || b.snippet || '';

			return aStr.length - bStr.length;
		}
	},

	/**
	 * Trigger auto-complete
	 *
	 * @param {Object} editor 	TextEditor
	 *
	 * @returns {Function}
	 */
	triggerAutocomplete(editor) {
		return atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', { activatedManually: false });
	},

	/**
	 * Check string for deprecated suffix
	 *
	 * @param {String} value 	Suggestions value or property
	 * @returns {Object}
	 */
	checkIsDeprecated(value) {
		if (!value) {
			return {
				name: value,
				deprecated: false
			};
		}
		const valueArray = value.split('|');
		const deprecated = (valueArray[1] === 'deprecated');
		return {
			name: valueArray[0],
			deprecated
		};
	},

	/**
	 * Auto-complete suggestion
	 *
	 * @param {String} type         			suggestion type: tag, method, property, value, #, .
	 * @param {String} text         			suggestion
	 * @param {String} snippet      			suggestion replacement text
	 * @param {String} displayText  			when specifying snippet
	 * @param {String} description  			override generated description
	 * @param {Boolean} deprecated  			is deprecate
	 * @param {String} api          			e.g. Ti.UI.Window
	 * @param {String} apiShortName 			e.g. Window
	 * @param {String} property     			e.g. statusBarStyle
	 * @param {String} prefix					prefix
	 * @param {String} replacementPrefix		replacement prefix
	 * @param {Function} onDidInsertSuggestion	callback function
	 *
	 * @returns {Object}
	 */
	suggestion({ type, text, snippet, displayText, description, deprecated, api, apiShortName, property, prefix, replacementPrefix, onDidInsertSuggestion }) {

		if (!this.completions) {
			this.loadCompletions();
		}

		if (property) {
			property = this.checkIsDeprecated(property).name;
		}

		if (!apiShortName && api) {
			apiShortName = api.split('.').pop();
		}

		let suggestion = {
			type: type,
			rightLabel: (type === 'tag') ? api : apiShortName,
			descriptionMoreURL: this.documentationURLForAPI(api, property, type),
			onDidInsertSuggestion: onDidInsertSuggestion,
			prefix: prefix,
			replacementPrefix: replacementPrefix,
			priority: 2
		};

		if (text) {
			const textInfo = this.checkIsDeprecated(text);
			deprecated = textInfo.deprecated;
			suggestion.text = textInfo.name;
			if (replacementPrefix) {
				suggestion.replacementPrefix = replacementPrefix;
			}
		} else {
			const displayTextInfo = this.checkIsDeprecated(displayText);
			deprecated = displayTextInfo.deprecated;
			suggestion.displayText = displayTextInfo.name;
			suggestion.snippet = snippet.replace('|deprecated', '');
		}

		// override styling
		// TODO: check style overrides compared with https://github.com/atom/atom/blob/master/static/variables/syntax-variables.less
		if (type === 'event') {
			suggestion.type = 'function';
			suggestion.iconHTML = '<i class="icon-zap"></i>';
		}

		if (description) {
			suggestion.description = description;
		} else if (type === 'property' || type === 'method' || type === 'event') {
			suggestion.description = (api) ? `${api}: ` : '';
			if (this.completions.titanium.properties[property]) {
				suggestion.description += this.completions.titanium.properties[property].description.replace('\n', '');
			} else if (property) {
				suggestion.description += `${property} ${type}`;
			}
		} else if (type === 'value') {
			// value
		} else if (api) {
			const apiObj = this.completions.titanium.types[api];
			if (apiObj) {
				suggestion.description = `${api}: ${this.completions.titanium.types[api].description.replace('\n', '')}`;
			} else {
				suggestion.description = api;
			}
		}

		if (deprecated) {
			suggestion.priority -= 1;

			if (suggestion.rightLabel) {
				suggestion.rightLabel = `${suggestion.rightLabel} (DEPRECATED)`;
			} else {
				suggestion.rightLabel = '(DEPRECATED)';
			}
		}
		return suggestion;
	},

	/**
	 *
	 * documentationURLforAPI
	 *
	 * @param {String} name     object name
	 * @param {String} value    method, property or event name (optional)
	 * @param {String} type     method | property | event (optional)
	 *
	 * @returns {String}
	 */
	documentationURLForAPI(name, value, type) {
		if (!name) {
			return null;
		}
		const apiRoot = 'http://docs.appcelerator.com/platform/latest/#!/api/';
		name = name.replace('Ti', 'Titanium');
		name = name.replace('Alloy.Abstract.', '');

		if (value && (type === 'method' || type === 'property' || type === 'event')) {
			return `${apiRoot}${name}-${type}-${value}`;
		}
		return `${apiRoot}${name}`;
	},

	/**
	 *
	 * generate auto-complete suggestions
	 */
	async generateAutoCompleteSuggestions({ force = false } = {}) {
		const sdkVersion = Project.sdk()[0];
		const sdkPath = Appc.sdkInfo(sdkVersion).path;

		try {
			// Generate the completions
			const [ alloy, sdk ] = await Promise.all([
				completion.generateAlloyCompletions(force, completion.CompletionsFormat.v2),
				completion.generateSDKCompletions(force, sdkVersion, sdkPath, completion.CompletionsFormat.v2)
			]);
			if (sdk || alloy) {
				let message = 'Autocomplete suggestions generated for';
				if (sdk) {
					message = `${message} Titanium ${sdk}`;
				}
				if (alloy) {
					message = `${message} Alloy ${alloy}`;
				}
				atom.notifications.addSuccess(message);
			}

		} catch (error) {
			atom.notifications.addError(`Error generating autocomplete suggestions. ${error.message}`);
		}
		this.loadCompletions(sdkVersion);
	},

	async loadCompletions(sdkVersion) {

		if (!sdkVersion) {
			sdkVersion = Project.sdk()[0];
		}
		if (this.completions) {
			return this.completions;
		}
		this.completions = await completion.loadCompletions(sdkVersion, completion.CompletionsFormat.v2);
		return this.completions;
	},
};
