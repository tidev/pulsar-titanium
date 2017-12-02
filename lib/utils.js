'use babel';

import fs from 'fs';
import path from 'path';
import _ from 'underscore';

let hiddenEditor;

export default {

	/**
	 * iOS provisioning profile matches App ID
	 *
	 * @param {String} profileAppId 	app ID of provisioing profile
	 * @param {String} appId 			app ID
	 * @returns {Boolean}
	 */
	iOSProvisioinngProfileMatchesAppId(profileAppId, appId) {

		// allow wildcard
		if (profileAppId === '*') {
			return true;
		}

		// allow explicit match
		if (profileAppId === appId) {
			return true;
		}

		// limited wildcard
		if (profileAppId.indexOf('*') === profileAppId.length - 1) {
			const profileAppIdPrefix = profileAppId.substr(0, profileAppId.length - 1);
			if (appId.indexOf(profileAppIdPrefix) === 0) {
				return true;
			}
		}

		return false;
	},

	/**
	 * Distribution output directory. Builds absolute path.
	 *
	 * @returns {String}
	 */
	distributionOutputDirectory() {
		const directory = atom.config.get('appcelerator-titanium.build.distributionOutputDirectory');
		if (!path.isAbsolute(directory)) {
			return path.join(atom.project.getPaths()[0], directory);
		}
		return directory;
	},

	/**
	 * Get file text editor
	 *
	 * @param {String} path 	file path
	 * @returns {Object}
	 */
	getFileEditor(path) {
		let targetEditor = atom.workspace.getTextEditors().find(editor => editor.getPath() === path);

		// if targetFile not opened or tokenized yet, use new buffer
		if (!targetEditor || (targetEditor && !targetEditor.tokenizedBuffer.fullyTokenized)) {
			hiddenEditor = hiddenEditor || atom.workspace.buildTextEditor();  // https://discuss.atom.io/t/best-way-to-create-new-texteditor/18995/5
			hiddenEditor.buffer.setPath(path);
			hiddenEditor.buffer.loadSync(path);
			targetEditor = hiddenEditor;
		}

		return targetEditor;
	},

	/**
	 * Text string of given line
	 *
	 * @param {Object} args 	.bufferPosition position in text buffer
	 * @returns {String}
	 */
	getLine(args) {
		return args.editor.getTextInRange([ [ args.bufferPosition.row, 0 ], args.bufferPosition ]);
	},

	/**
	 * Alloy app directory
	 *
	 * @returns {String}
	 */
	getAlloyRootPath() {
		return path.join(atom.project.getPaths()[0], 'app');
	},

	/**
	 * Returns true if current project is an Alloy project
	 *
	 * @returns {Boolean}
	 */
	isAlloyProject() {
		return this.directoryExists(this.getAlloyRootPath());
	},

	/**
	 * i18n project directory
	 *
	 * @returns {String}
	 */
	getI18nPath() {
		if (this.isAlloyProject()) {
			return path.join(this.getAlloyRootPath(), 'i18n');
		}
	},

	/**
	 * Returns true if file exists at given path
	 *
	 * @param {String} path		file path
	 * @returns {Boolean}
	 */
	fileExists(path) {
		try {
			var stat = fs.statSync(path);
			return stat.isFile();
		} catch (err) {
			return !(err && err.code === 'ENOENT');
		}
	},

	/**
	 * Returns true if directory exists at given path
	 *
	 * @param {String} path 	directory path
	 * @returns {Boolean}
	 */
	directoryExists(path) {
		try {
			var stat = fs.statSync(path);
			return stat.isDirectory();
		} catch (err) {
			return !(err && err.code === 'ENOENT');
		}
	},

	/**
	 * Returns prefix for given text buffer position
	 *
	 * @param {Object} request 	request object passed to getSuggestions() method
	 * @returns {String}
	 */
	getCustomPrefix(request) {
		const line = request.editor.getTextInRange([ [ request.bufferPosition.row, 0 ], request.bufferPosition ]);
		const regex = /^[\t\s]*$|[^\s\\()"':,;<>~!@$%^&*|+=[\]{}`?…]+$/;
		const matchResult = line.match(regex);
		return matchResult ? matchResult[0] : '';

	},

	/**
	 * Convert to unix path
	 *
	 * @param {String} p 	path
	 * @returns {String}
	 */
	toUnixPath(p) { // https://github.com/anodynos/upath
		let double = /\/\//;
		p = p.replace(/\\/g, '/');
		while (p.match(double)) {
			p = p.replace(double, '/');
		}
		return p;
	},

	/**
	 * Returns recursive keys from given object
	 *
	 * @param {Object} obj 	object to get keys of
	 * @returns {Array}
	 */
	getAllKeys(obj) {
		if (!_.isObject(obj)) {
			return [];
		}
		const result = [];
		_.each(obj, function (value, key) {
			result.push(key);
			_.each(module.exports.getAllKeys(value), function (value) {
				result.push(key + '.' + value);
			});
		});
		return result;
	},

	/**
	 * Returns true if given strings have the same first character
	 *
	 * @param {String} str1 	string 1
	 * @param {String} str2 	string 2
	 * @returns {Boolean}
	 */
	firstCharsEqual(str1, str2) {
		str1 = str1.replace(/"/g, '');
		str2 = str2.replace(/"/g, '');
		return str1[0].toLowerCase() === str2[0].toLowerCase();
	},

	/**
	 * Returns string with capitalized first letter
	 *
	 * @param {String} string 	string
	 * @returns {String}
	 */
	capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
};
