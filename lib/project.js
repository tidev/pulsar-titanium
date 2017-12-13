'use babel';

import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';
import { Emitter } from 'atom';
import Utils from './utils';

const TIAPP_FILENAME = 'tiapp.xml';
const EVENT_MODIFIED = 'modified';
const TIMODULEXML_FILENAME = 'timodule.xml';
const MANIFEST_FILENAME = 'manifest';

const Project = {

	isTitaniumApp: false,
	isTitaniumModule: false,
	tiapp: undefined,
	modules: [],
	emitter: new Emitter(),

	/**
	 * Load tiapp.xml file
	 */
	load: function () {
		if (!atom.project.getPaths() || atom.project.getPaths().length === 0) {
			return;
		}

		this.loadTiappFile();

		if (!this.isTitaniumApp) {
			this.loadModules();
		}
	},

	/**
	 * Load tiapp file
	 *
	 */
	loadTiappFile: function () {
		const filePath = path.join(atom.project.getPaths()[0], TIAPP_FILENAME);
		this.isTitaniumApp = false;
		if (Utils.fileExists(filePath)) {
			const fileData = fs.readFileSync(filePath, 'utf-8');
			const parser = new xml2js.Parser();
			let json;
			parser.parseString(fileData.substring(0, fileData.length), function (err, result) {
				json = result;
			});
			this.tiapp = json['ti:app'];
			this.isTitaniumApp = true;

			if (!this.watcher) {
				this.watcher = atom.project.onDidChangeFiles(events => {
					for (const event of events) {
						if (event.path === filePath && event.action === 'modified') {
							this.loadTiappFile();
							this.emitter.emit(EVENT_MODIFIED);
						}
					}
				});
			}
		}
	},

	/**
	 * Attempt to find module projects by loading timodule.xml and manifest files
	 */
	loadModules: function () {
		const paths = [
			path.join(atom.project.getPaths()[0]),
			path.join(atom.project.getPaths()[0], 'android'),
			path.join(atom.project.getPaths()[0], 'ios'),
			path.join(atom.project.getPaths()[0], 'iphone'),
			path.join(atom.project.getPaths()[0], 'windows'),
		];
		for (let i = 0, numPaths = paths.length; i < numPaths; i++) {
			this.loadModuleAt(paths[i]);
		}
	},

	/**
	 * Load module
	 *
	 * @param {String} modulePath		path to module
	 */
	loadModuleAt: function (modulePath) {
		if (Utils.directoryExists(modulePath)) {
			const timodulePath = path.join(modulePath, TIMODULEXML_FILENAME);
			const manifestPath = path.join(modulePath, MANIFEST_FILENAME);

			if (!Utils.fileExists(timodulePath)) {
				return;
			}

			const fileData = fs.readFileSync(timodulePath, 'utf-8');
			const parser = new xml2js.Parser();
			let json;
			parser.parseString(fileData.substring(0, fileData.length), function (err, result) {
				json = result;
			});
			if (json['ti:module']) {

				if (!fs.existsSync(manifestPath)) {
					return;
				}

				const manifest = {
					path: modulePath
				};

				fs.readFileSync(manifestPath).toString().split(/\r?\n/).forEach(function (line) {
					const match = line.match(/^(\S+)\s*:\s*(.*)$/);
					if (match) {
						manifest[match[1].trim()] = match[2].trim();
					}
				});
				manifest.platform = Utils.normalisedPlatform(manifest.platform);

				this.modules.push(manifest);

				this.isTitaniumModule = true;
			}
		}
	},

	/**
	 * Register on modified callback
	 *
	 * @param {Function} callback	callback function
	 */
	onModified: function (callback) {
		this.emitter.on(EVENT_MODIFIED, callback);
	},

	/**
	 * App ID
	 *
	 * @returns {String}
	 */
	appId: function () {
		if (this.isTitaniumApp) {
			return String(this.tiapp.id);
		}
	},

	/**
	 * App name
	 *
	 * @returns {String}
	 */
	appName: function () {
		if (this.isTitaniumApp) {
			return String(this.tiapp.name);
		} else {
			return this.modules[0].name;
		}
	},

	platforms: function () {
		if (this.isTitaniumModule) {
			return this.modules.map(module => module.platform);
		}
	},

	pathForPlatform (platform) {
		const module = this.modules.find(module => Utils.normalisedPlatform(module.platform) === platform);
		if (module) {
			return module.path;
		}
	},

	/**
	 * SDK version
	 *
	 * @returns {String}
	 */
	sdk: function () {
		if (this.isTitaniumApp) {
			return this.tiapp['sdk-version'];
		}
	},

	/**
	 * App icon file path
	 *
	 * @returns {String}
	 */
	appIcon: function () {
		if (this.isTitaniumApp) {
			const files = [ 'app/DefaultIcon.png', 'app/DefaultIcon-ios.png', 'DefaultIcon.png', 'DefaultIcon-ios.png' ];
			for (const file of files) {
				const filePath = path.join(atom.project.getPaths()[0], file);
				if (fs.existsSync(filePath)) {
					return filePath;
				}
			}
		}
	},

	/**
	 * Dispose of resources
	 */
	destroy: function () {
		this.emitter.dispose();
		this.watcher.dispose();
	}
};

export default Project;
