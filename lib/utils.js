'use babel';

import Appc from './appc';
import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import _ from 'underscore';
import { TextBuffer } from 'atom';
import { platform } from 'os';

export default {

	/**
	 * Returns available target platforms
	 *
	 * @returns {Array}
	 */
	platforms () {
		switch (platform()) {
			case 'darwin':
				return [ 'ios', 'android' ];
			case 'win32':
				return [ 'android' ];
			case 'linux':
				return [ 'android' ];
		}
	},

	/**
	 * Returns correct name for given platform
	 *
	 * @param {String} platform 	target platform
	 * @returns {String}
	 */
	nameForPlatform (platform) {
		platform = this.normalisedPlatform(platform);
		switch (platform) {
			case 'android':
				return 'Android';
			case 'ios':
				return 'iOS';
		}
	},

	/**
	 * Returns normalised name for platform
	 *
	 * @param {String} platform 	target platform
	 * @returns {String}
	 */
	normalisedPlatform (platform) {
		if (platform === 'iphone' || platform === 'ipad') {
			return 'ios';
		}
		return platform.toLowerCase();
	},

	/**
	 * iOS provisioning profile matches App ID
	 *
	 * @param {String} profileAppId 	app ID of provisioning profile
	 * @param {String} appId 			app ID
	 * @returns {Boolean}
	 */
	iOSProvisioningProfileMatchesAppId(profileAppId, appId) {

		// allow wildcard
		if (String(profileAppId) === '*') {
			return true;
		}

		// allow explicit match
		if (String(profileAppId) === appId) {
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
		const directory = this.getConfigSetting('build.distributionOutputDirectory');
		if (!path.isAbsolute(directory)) {
			return path.join(atom.project.getPaths()[0], directory);
		}
		return directory;
	},

	/**
	 * Get text buffer
	 *
	 * @param {String} path 	file path
	 * @returns {Object}
	 */
	getTextBuffer(path) {
		let editor = atom.workspace.getTextEditors().find(editor => editor.getPath() === path);
		if (editor && editor.tokenizedBuffer.fullyTokenized) {
			return editor.getBuffer();
		}
		return TextBuffer.loadSync(path);
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
		if (str1 && str2) {
			str1 = str1.replace(/["']/g, '');
			str2 = str2.replace(/["']/g, '');
			return str1[0].toLowerCase() === str2[0].toLowerCase();
		}
	},

	/**
	 * Returns string with capitalized first letter
	 *
	 * @param {String} string 	string
	 * @returns {String}
	 */
	capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	createAppArguments(options) {
		const args = [
			'create',
			'--type', 'app',
			'--name', options.name,
			'--id', options.id,
			'--platforms', options.platforms.join(','),
			'--workspace-dir', options.workspaceDir,
			'--no-prompt',
			'--log-level', 'trace'
		];
		return args;
	},

	/**
	 * Determine the correct certificate name value to provide to the SDK build process.
	 * Prior to SDK 8.2.0 only the "name" property was allowed, but for 8.2.0 and above
	 * we should prefer the fullname as it differentiates between the iPhone certs and
	 * the generic Apple certs.
	 *
	 * @param {String} certificateName - Certificate fullname.
	 * @param {String} sdkVersion - Projects SDK version in the tiapp.xml.
	 * @param {String} certificateType - Type of certificate type to look up, developer or distribution.
	 *
	 * @returns {String}
	 */
	getCorrectCertificateName (certificateName, sdkVersion, certificateType) {
		const certificate = Appc.iosCertificates(certificateType).find(certificate => certificate.fullname === certificateName);
		if (!certificate) {
			return;
		}
		if (semver.gte(semver.coerce(sdkVersion), '8.2.0')) {
			return certificate.fullname;
		} else {
			return certificate.name;
		}
	},

	async getNodeSupportedVersion(sdkVersion) {

		const sdkInfo = Appc.sdkInfo(sdkVersion);
		if (!sdkInfo) {
			return;
		}

		const sdkPath = sdkInfo.path;

		const packageJSON = path.join(sdkPath, 'package.json');
		const { vendorDependencies } = await fs.readJSON(packageJSON);
		return vendorDependencies.node;
	},

	/**
	 * Retrieve a setting value, handling falling back to the old namespace
	 *
	 * @param {string} configString - The setting string to retrieve
	 * @returns {string|boolean|number}
	 */
	getConfigSetting (configString) {
		configString = configString.replace(/^(appcelerator-titanium|titanium)\./, '');

		let setting = atom.config.get(`titanium.${configString}`);

		if (!setting) {
			setting = atom.config.get(`appcelerator-titanium.${configString}`);
		}

		return setting;
	}
};
