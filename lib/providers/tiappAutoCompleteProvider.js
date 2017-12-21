'use babel';

import fs from 'fs';
import path from 'path';
import _ from 'underscore';
import Utils from '../utils';
import Appc from '../appc';
import Project from '../project';
import autoCompleteHelper from './autoCompleteHelper';

const wrapperTagPattern = /<([a-zA-Z][-a-zA-Z]*)(.*?)>(?:\s*|$)/;

const getDirectories = srcpath => fs.readdirSync(srcpath).filter(file => fs.statSync(path.join(srcpath, file)).isDirectory());

export default {
	selector: '.text.xml',
	disableForSelector: 'text.xml .comment',
	filterSuggestions: true,
	inclusionPriority: 1,
	// excludeLowerPriority: true,
	suggestionPriority: 2,

	getSuggestions(request) {
		if (!Project.isTitaniumApp) {
			return;
		}
		const { editor, bufferPosition } = request;
		if (!request.editor.getPath().endsWith('tiapp.xml')) {
			return;
		}

		// const scopes = request.scopeDescriptor.getScopesArray();
		const completions = [];

		const tag = this.getPreviousTag(editor, bufferPosition);

		//
		// SDK version
		//
		if (tag === 'sdk-version') {
			const sdks = Appc.sdks();
			for (let idx in sdks) {
				completions.push({
					text: sdks[idx].fullversion,
					displayText: sdks[idx].fullversion
				});
			}

		//
		// Module
		//
		} else if (tag === 'module') {
			const modulePath = path.join(atom.project.getPaths()[0], 'modules');
			if (!Utils.directoryExists(modulePath)) {
				return;
			}
			const modules = {};
			_.each(getDirectories(modulePath), function (platform) {
				// body...
				const platformModulePath = path.join(atom.project.getPaths()[0], 'modules', platform);
				return _.each(getDirectories(platformModulePath), function (moduleName) {
					if (!modules[moduleName]) {
						modules[moduleName] = {};
					}
					const curModule = modules[moduleName];
					return curModule.platform = (curModule.platform || []).concat(platform);
				});
			});
			for (let key in modules) {
				// console.log key
				completions.push({
					text: key,
					rightLabel: modules[key].platform.join(',')
				});
			}
		}

		// console.log(completions);
		// completions.sort(autoCompleteHelper.sort);

		return completions;
	},

	onDidInsertSuggestion({ editor, suggestion }) {
		if (suggestion.type === 'attribute') {
			return setTimeout(autoCompleteHelper.triggerAutocomplete.bind(this, editor), 1);
		}
	},

	getPreviousTag(editor, bufferPosition) {
		let { row } = bufferPosition;
		while (row >= 0) {
			const matches = wrapperTagPattern.exec(editor.lineTextForBufferRow(row));
			if (matches && matches.length >= 2) {
				return matches[1];
			}
			row--;
		}
	},
};
