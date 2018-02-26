'use babel';

import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import Appc from '../appc';

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
		// if (a.priority==0 ^ b.priority==0){
		//     console.log(a.priority + ' ' + b.priority);
		if (a.priority && b.priority && a.priority !== b.priority) {
			return b.priority - a.priority;
		} else {
			let aStr = a.text || a.displayText || a.snippet || '';
			let bStr = b.text || b.displayText || b.snippet || '';

			// return bStr.toLowerCase() - aStr.toLowerCase();
			aStr = aStr.toLowerCase();
			bStr = bStr.toLowerCase();

			let res = 0;
			if (aStr < bStr) {
				res = -1;
			} else if (aStr > bStr) {
				res = 1;
			}

			return res;
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

		const completions = require('./completions');

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
			if (completions.properties[property]) {
				suggestion.description += completions.properties[property].description.replace('\n', '');
			} else if (property) {
				suggestion.description += `${property} ${type}`;
			}
		} else if (type === 'value') {
			// value
		} else if (api) {
			const apiObj = completions.types[api];
			if (apiObj) {
				suggestion.description = `${api}: ${completions.types[api].description.replace('\n', '')}`;
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
	generateAutoCompleteSuggestions() {
		const completionsFilename = path.join(__dirname, 'completions.js');
		if (!atom.config.get('appcelerator-titanium.general.generateAutoCompleteSuggestions')
			&& fs.existsSync(completionsFilename)) {
			return;
		}
		atom.config.set('appcelerator-titanium.general.generateAutoCompleteSuggestions', false);
		// atom.notifications.addInfo('Generating auto-complete suggestions...');

		const appcPath = path.join(homedir(), '.appcelerator/install');
		const version = fs.readFileSync(path.join(appcPath, '.version'), 'utf8');
		const alloyPath = path.join(appcPath, version, 'package/node_modules/alloy');
		// const alloyApi = JSON.parse(fs.readFileSync(path.join(alloyPath, 'docs/api.jsca'), 'utf8'));
		const sdk = Appc.selectedSdk();
		const titaniumAPIPath = path.join(sdk.path, 'api.jsca');
		const api = JSON.parse(fs.readFileSync(titaniumAPIPath, 'utf8'));

		// generate tag list
		const fns = fs.readdirSync(path.join(alloyPath, '/Alloy/commands/compile/parsers'));
		let tagDic = {};
		for (const fn of fns) {
			if (!fn.endsWith('.js')) {
				continue;
			}
			const ar = fn.split('.');
			const tagName = ar[ar.length - 2];
			if (tagName.indexOf('_') !== 0 && tagName[0] === tagName[0].toUpperCase()) {
				tagDic[tagName] = {
					apiName: fn.replace('.js', '')
				};
			} else if (tagName === '_ProxyProperty' && fn.indexOf('Ti.UI') === 0) {
				tagDic[ar[ar.length - 3]] = { // Ti.UI.Window._ProxyProperty
					apiName: fn.replace('.js', '').replace('._ProxyProperty', '')
				};
			}
		}

		// add missing tags
		Object.assign(tagDic, {
			View: {
				apiName: 'Ti.UI.View'
			},
			Templates: {},
			HeaderView: {},
			FooterView: {},
			ScrollView: {
				apiName: 'Ti.UI.ScrollView'
			},
			Slider: {
				apiName: 'Ti.UI.Slider'
			},
			TableViewRow: {
				apiName: 'Ti.UI.TableViewRow'
			},
			Alloy: {},
			ActivityIndicator: {
				apiName: 'Ti.UI.ActivityIndicator'
			},
			WebView: {
				apiName: 'Ti.UI.WebView'
			}
		});

		// property list
		const types = {};
		const props = {};
		api.types.forEach((type) => {
			if (type.deprecated) {
				return;
			}

			let propertyNamesOfType = [];
			type.properties.forEach((prop) => {
				if (prop.permission !== 'read-only' && prop.name.indexOf('Modules.') !== 0) {

					propertyNamesOfType.push(prop.name);

					// property name
					if (props[prop.name]) { // if duplicated property name - merge available values
						Object.assign(props[prop.name], {
							description: props[prop.name].description === prop.description.replace(/<p>|<\/p>/g, '') ? props[prop.name].description : ''
						});
						if (prop.constants.length) {
							const values = props[prop.name].values ? props[prop.name].values.concat(prop.constants) : prop.constants;
							props[prop.name].values = [ ...new Set(values) ];
						}

					} else {
						props[prop.name] = {
							description: prop.description.replace(/<p>|<\/p>/g, ''),
							type: prop.type
						};
						if (prop.constants.length) {
							props[prop.name].values = prop.constants;
						}
					}
				}
			});

			types[type.name.replace(/Titanium\./g, 'Ti.')] = {
				description: type.description.replace(/<p>|<\/p>/g, ''),
				functions: type.functions.map(f => {
					return (f.deprecated) ? f.name + '|deprecated' : f.name;
				}),
				properties: propertyNamesOfType,
				events: type.events.map(e => {
					return (e.deprecated) ? e.name + '|deprecated' : e.name;
				})
			};
		});

		// Alias
		for (const key in props) {
			const prop = props[key];
			if (prop.type === 'Boolean') {
				prop.values = [ 'true', 'false' ];
			} else if (prop.values) {
				// alias Titanium -> Ti
				prop.values = prop.values.map(val => {
					const splitedName = val.split('.');
					const typeName = splitedName.slice(0, -1).join('.');
					const tiUIProps = api.types.find(type => type.name === typeName).properties;
					const curPropInfo = tiUIProps.find(prop => prop.name === splitedName[splitedName.length - 1]);

					let shortName = val.replace(/Titanium\./g, 'Ti.');
					if (curPropInfo.deprecated) {
						shortName += '|deprecated';
					}
					return shortName;
				});
			}

			if (/[Cc]olor$/.test(key)) {
				prop.values = [
					'\'transparent\'', '\'aqua\'', '\'black\'', '\'blue\'', '\'brown\'', '\'cyan\'', '\'darkgray\'', '\'fuchsia\'', '\'gray\'', '\'green\'',
					'\'lightgray\'', '\'lime\'', '\'magenta\'', '\'maroon\'', '\'navy\'', '\'olive\'', '\'orange\'', '\'pink\'', '\'purple\'', '\'red\'',
					'\'silver\'', '\'teal\'', '\'white\'', '\'yellow\''
				];
			}
		}

		// missing types
		Object.assign(types, {
			'Alloy.Abstract.ItemTemplate': {
				description: 'Template that represents the basic appearance of a list item.',
				functions: [
				],
				properties: [
					'name',
					'height'
				],
				events: []
			},
			'Alloy.Widget': {
				description: 'Widgets are self-contained components that can be easily dropped into an Alloy project.',
				functions: [],
				properties: [
					'src'
				],
				events: []
			},
			'Alloy.Require': {
				description: 'Require alloy controller',
				functions: [],
				properties: [
					'src'
				],
				events: []
			}
		});

		// missing values
		props.layout.values = [ '\'vertical\'', '\'horizontal\'', '\'composite\'' ];

		let sortedTagDic = {};
		Object.keys(tagDic)
			.sort()
			.forEach(k => sortedTagDic[k] = tagDic[k]);

		const sortedProps = {};
		Object.keys(props)
			.sort()
			.forEach(k => sortedProps[k] = props[k]);

		fs.writeFile(completionsFilename,
			'module.exports = ' + JSON.stringify({
				version: 1,
				sdkVersion: `${sdk.fullversion}`,
				properties: sortedProps,
				tags: sortedTagDic,
				types: types
			}, null, 4),
			function (err) {
				if (err) {
					// console.error(err);
				} else {
					atom.notifications.addSuccess(`Appcelerator Titanium: Auto-complete suggestions generated for Titanium SDK ${sdk.fullversion}`);
				}
			});
	}
};
