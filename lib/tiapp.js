'use babel';

import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';
import { Emitter, File } from 'atom';

const TIAPP_FILENAME = 'tiapp.xml';
const EVENT_MODIFIED = 'modified';

const Tiapp = {

	isTitaniumProject: false,
	tiapp: undefined,
	emitter: new Emitter(),

	/**
	 * Load tiapp.xml file
	 */
	load: function () {
		this.loadFileAt(atom.project.getPaths()[0] + '/' + TIAPP_FILENAME);
	},

	/**
	 * Load file
	 *
	 * @param {String} filePath		path to tiapp.xml file
	 */
	loadFileAt: function (filePath) {
		this.isTitaniumProject = false;
		const file = new File(filePath);
		if (file.existsSync()) {
			const fileData = fs.readFileSync(filePath, 'utf-8');
			const parser = new xml2js.Parser();
			let json;
			parser.parseString(fileData.substring(0, fileData.length), function (err, result) {
				json = result;
			});
			this.tiapp = json['ti:app'];
			this.isTitaniumProject = true;

			if (!this.watcher) {
				this.watcher = atom.project.onDidChangeFiles(events => {
					for (const event of events) {
						if (event.path === filePath && event.action === 'modified') {
							this.loadFileAt(filePath);
							this.emitter.emit(EVENT_MODIFIED);
						}
					}
				});
			}
		}
	},

	/**
	 * Register on modified callback
	 *
	 * @param {Function} callback	callback function
	 */
	onModified: function (callback) {
		Tiapp.emitter.on(EVENT_MODIFIED, callback);
	},

	/**
	 * App ID
	 *
	 * @returns {String}
	 */
	appId: function () {
		return String(this.tiapp.id);
	},

	/**
	 * App name
	 *
	 * @returns {String}
	 */
	appName: function () {
		return String(this.tiapp.name);
	},

	/**
	 * SDK version
	 *
	 * @returns {String}
	 */
	sdk: function () {
		return this.tiapp['sdk-version'];
	},

	/**
	 * App icon file path
	 *
	 * @returns {String}
	 */
	appIcon: function () {
		const files = [ 'app/DefaultIcon.png', 'app/DefaultIcon-ios.png', 'DefaultIcon.png', 'DefaultIcon-ios.png' ];
		for (const file of files) {
			const filePath = path.join(atom.project.getPaths()[0], file);
			if (fs.existsSync(filePath)) {
				return filePath;
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

export default Tiapp;
