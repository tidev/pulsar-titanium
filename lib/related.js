'use babel';

import _ from 'underscore';
import util from './utils';
import path from 'path';

let alloyDirectoryMap = {
	xml: 'views',
	tss: 'styles',
	js: 'controllers'
};

export default {

	/**
	 * Open related file
	 *
	 * @param {String} type 	view, style, controller
	 * @param {Object} options 	passed to atom.workspace.open() method
	 * @returns {Promise}
	 */
	openRelatedFile(type, options) {
		options = options || {};
		let editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}

		options.searchAllPanes = true;
		return atom.workspace.open(this.getTargetPath(type), options);
	},

	/**
	 * Open or close related files
	 */
	async toggleAllRelatedFiles() {
		let editor = atom.workspace.getActiveTextEditor();
		if (!editor) {
			return;
		}

		let editorPanes = atom.workspace.getCenter().getPanes();
		let isAlreadyAllFocused = true;

		var activeItemPaths = _.map(editorPanes, (pane) => {
			if (pane.activeItem && pane.activeItem.getPath) {
				return pane.activeItem.getPath();
			}
		});

		let relatedFilePaths = this.getRelatedFilePaths(editor.getPath());

		_.each(relatedFilePaths, (path) => {
			if (!_.contains(activeItemPaths, path)) {
				isAlreadyAllFocused = false;
			}
		});

		// if hanve 3 pane and active is already relatedfiles
		if (editorPanes.length < 3 || !isAlreadyAllFocused) {
			this.openAllFiles();
		} else {
			this.closeRelatedFiles();
		}
	},

	/**
	 * Open related files
	 */
	async openAllFiles() {
		let editor = atom.workspace.getActiveTextEditor();
		let previousActivePane = atom.workspace.getActivePane();
		if (!editor) {
			return;
		}

		const currentFilePath = editor.getPath();
		let relatedFilePaths = this.getRelatedFilePaths(currentFilePath);
		if (!relatedFilePaths.length) {
			return;
		}

		// if number of panes is under 3, make more.
		// let numberOfPanes = atom.workspace.getCenter().getPanes();

		while (atom.workspace.getCenter().getPanes().length < (relatedFilePaths.length + 1)) {
			let lastPane = _.last(atom.workspace.getCenter().getPanes());
			lastPane.splitRight();
		}

		let panes = atom.workspace.getCenter().getPanes();

		let newPaneIdx = 0;
		for (const pane of _.without(panes, previousActivePane)) {
			let filePath = relatedFilePaths[newPaneIdx++];
			if (filePath) {
				pane.activate();
				await atom.workspace.open(filePath, {}).then(function () {
					previousActivePane.activate();
				});
			}
		}

		// close duplicateItem

		_.each(panes, (pane) => {
			_.each(relatedFilePaths.concat(currentFilePath), (path) => {
				let duplicateItem = pane.itemForURI(path);
				if (duplicateItem && duplicateItem !== pane.getActiveItem()) {
					pane.destroyItem(duplicateItem);
				}
			});
		});
	},

	/**
	 * Close related files
	 *
	 * @param {Object}	args				function args
	 * @param {Boolean} args.forceAllClose	close current file
	 */
	closeRelatedFiles(args = {}) {
		let { forceAllClose } = args;
		let activeEditor = atom.workspace.getActiveTextEditor();
		if (!activeEditor) {
			return;
		}

		let relatedFilePaths = this.getRelatedFilePaths(activeEditor.getPath());
		if (forceAllClose) {
			relatedFilePaths.push(activeEditor.getPath());
		}
		let allEditors = atom.workspace.getTextEditors();

		// find and close
		_.each(allEditors, (editor) => {
			if (_.contains(relatedFilePaths, editor.getPath())) {
				editor.destroy();
			}
		});
	},

	/**
	 * Get paths for related files
	 *
	 * @param {String} editorPath 	path of file open in active editor
	 * @returns {Array}
	 */
	getRelatedFilePaths(editorPath) {
		let pathSplit = path.relative(util.getAlloyRootPath(), editorPath).split(path.sep);
		let currentType = pathSplit[0] === 'widgets' ? pathSplit[2] : pathSplit[0];
		let hasRelatedFiles = [ 'views', 'styles', 'controllers' ].indexOf(currentType) >= 0;
		let fileExt = path.parse(editorPath).ext.substr(1);
		let isAppTss = editorPath.endsWith(path.join('/app/styles/app.tss')); // TODO : make more advanced Detection
		let isAlloyJs = editorPath.endsWith(path.join('/app/alloy.js')); // TODO : make more advanced Detection

		if (!util.isAlloyProject() || (!hasRelatedFiles && !isAppTss && !isAlloyJs)) {
			return [];
		}

		let relatedFilePaths = [];

		if (isAppTss) {
			relatedFilePaths = [ editorPath.replace(path.join('/app/styles/app.tss'), path.join('/app/alloy.js')) ];
		} else if (isAlloyJs) {
			relatedFilePaths = [ editorPath.replace(path.join('/app/alloy.js'), path.join('/app/styles/app.tss')) ];
		} else {
			_.each(alloyDirectoryMap, (folderName, ext) => {
				if (ext !== fileExt) {
					return relatedFilePaths.push(this.getTargetPath(ext, editorPath));
				}
			});
		}

		return relatedFilePaths;
	},

	/**
	 * Get path of related file
	 *
	 * @param {String} type 			view, style, controller
	 * @param {String} currentFilePath	path of current file
	 * @returns {String}
	 */
	getTargetPath(type, currentFilePath) {
		if (!currentFilePath) {
			currentFilePath = atom.workspace.getActiveTextEditor().getPath();
		}

		let pathUnderAlloy = path.relative(util.getAlloyRootPath(), currentFilePath);
		let pathSplitArr = pathUnderAlloy.split(path.sep);

		if (pathSplitArr[0] === 'widgets') {
			pathSplitArr[2] = alloyDirectoryMap[type];  // change type
		} else {
			pathSplitArr[0] = alloyDirectoryMap[type];  // change type
		}

		let fileSplitArr = pathSplitArr[pathSplitArr.length - 1].split('.');
		fileSplitArr[fileSplitArr.length - 1] = type; // change ext

		return path.resolve(util.getAlloyRootPath(), pathSplitArr.join(path.sep), '..', fileSplitArr.join('.'));
	}
};
