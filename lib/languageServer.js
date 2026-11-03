'use babel';

import { AutoLanguageClient } from '@savetheclocktower/atom-languageclient';
import { execFileSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import semver from 'semver';

const PACKAGE_NAME = 'titanium';
const CONFIG_KEY = `${PACKAGE_NAME}.languageServer`;
const SERVER_PACKAGE = '@titanium-sdk/language-server';
const TIAPP_FILENAME = 'tiapp.xml';

/**
 * Node versions the server runs on, used when the server's own package.json can't be read
 * (for instance a custom `serverPath` pointing at a single file).
 */
const DEFAULT_NODE_RANGE = '>=20.18';

/**
 * The grammars the server is started for, and the language id each is reported as.
 *
 * The server would also work these out from the grammar name, but Pulsar and Atom report names
 * like `Alloy (XML)` rather than language ids, so they're given explicitly here.
 */
const LANGUAGE_IDS = {
	'text.alloyxml': 'xml',
	'text.xml': 'xml',
	'source.css.tss': 'tss',
	'source.js': 'javascript',
	'source.ts': 'typescript'
};

/**
 * Starts the Titanium Language Server (https://github.com/tidev/titanium-language-server) for
 * Titanium projects, and connects it to the editor services the language client knows about:
 * autocomplete-plus, hyperclick (through the package's own provider), linter, intentions,
 * hover and datatips.
 *
 * The server needs a newer Node than the one built into the editor, so it is run with the
 * user's own `node`. When that is missing or too old, or the server is turned off in the
 * settings, no server is started and the package's built-in providers keep working.
 */
export default class TitaniumLanguageClient extends AutoLanguageClient {

	constructor() {
		super();
		this.enabled = false;
		// undefined until checked, then either { nodePath, serverPath } or null
		this.runtime = undefined;
		this.titaniumRoots = new Map();
	}

	getGrammarScopes() {
		return Object.keys(LANGUAGE_IDS);
	}

	getLanguageName() {
		return 'Titanium';
	}

	getServerName() {
		return 'Titanium Language Server';
	}

	getPackageName() {
		return PACKAGE_NAME;
	}

	getLanguageIdFromEditor(editor) {
		return LANGUAGE_IDS[editor.getGrammar().scopeName] || super.getLanguageIdFromEditor(editor);
	}

	/**
	 * Above the built-in providers, which exclude lower priorities
	 *
	 * @returns {Number}
	 */
	getInclusionPriorityForAutocomplete() {
		return 2;
	}

	activate() {
		// read once: switching between the server and the built-in providers takes a reload
		this.enabled = Boolean(atom.config.get(`${CONFIG_KEY}.enabled`));
		super.activate();
		this._disposable.add(
			atom.project.onDidChangePaths(() => this.titaniumRoots.clear()),
			atom.project.onDidChangeFiles(events => {
				if (events.some(event => isTiapp(event.path) || isTiapp(event.oldPath))) {
					this.titaniumRoots.clear();
				}
			})
		);
	}

	/**
	 * Only starts for files in a project that contains a Titanium app, so plain JavaScript and XML
	 * projects never start a server.
	 *
	 * @param {TextEditor} editor - The editor being opened
	 * @returns {Boolean}
	 */
	shouldStartForEditor(editor) {
		if (!this.enabled || !super.shouldStartForEditor(editor)) {
			return false;
		}
		const projectPath = this.determineProjectPath(editor);
		if (!projectPath || !this.containsTitaniumProject(projectPath)) {
			return false;
		}
		return this.resolveRuntime() !== null;
	}

	startServerProcess(projectPath) {
		const { nodePath, serverPath } = this.resolveRuntime();
		const env = Object.assign({}, process.env);
		// inherited from the editor, and would make an Electron binary behave like node
		delete env.ELECTRON_RUN_AS_NODE;
		delete env.ELECTRON_NO_ATTACH_CONSOLE;
		this.logger.debug(`starting "${nodePath} ${serverPath} --stdio"`);
		return spawn(nodePath, [ serverPath, '--stdio' ], { cwd: projectPath, env, windowsHide: true });
	}

	/**
	 * Whether the server is running for this editor, so the built-in providers should stay out of
	 * its way. False while the server is still starting, and again if it stops.
	 *
	 * @param {TextEditor} editor - The editor to check
	 * @returns {Boolean}
	 */
	servesEditor(editor) {
		if (!this.enabled || !this._serverManager || !editor || !editor.getGrammar) {
			return false;
		}
		if (!this.getGrammarScopes().includes(editor.getGrammar().scopeName)) {
			return false;
		}
		const projectPath = this.determineProjectPath(editor);
		return Boolean(projectPath) && this._serverManager.getActiveServers().some(server => server.projectPath === projectPath);
	}

	/**
	 * Go to definition from the server, in the shape hyperclick takes
	 *
	 * @param {TextEditor} editor - The editor clicked in
	 * @param {Range} range - The range of the word clicked
	 * @returns {Promise<Object|null>} A hyperclick suggestion, or null when the server found nothing
	 */
	async getHyperclickSuggestion(editor, range) {
		const result = await this.getDefinition(editor, range.start);
		if (!result || !result.definitions || result.definitions.length === 0) {
			return null;
		}
		const open = definition => () => atom.workspace.open(definition.path, {
			initialLine: definition.position.row,
			initialColumn: definition.position.column,
			searchAllPanes: true
		});
		const queryRange = result.queryRange && result.queryRange.length ? result.queryRange : range;
		if (result.definitions.length === 1) {
			return { range: queryRange, callback: open(result.definitions[0]) };
		}
		const [ projectPath ] = atom.project.relativizePath(editor.getPath());
		return {
			range: queryRange,
			callback: result.definitions.map(definition => ({
				title: projectPath ? path.relative(projectPath, definition.path) : definition.path,
				rightLabel: `${definition.position.row + 1}`,
				callback: open(definition)
			}))
		};
	}

	/**
	 * Whether a folder is a Titanium app, or directly contains one — the same places the server
	 * looks for projects
	 *
	 * @param {String} folder - A project folder
	 * @returns {Boolean}
	 */
	containsTitaniumProject(folder) {
		if (!this.titaniumRoots.has(folder)) {
			this.titaniumRoots.set(folder, findTiapp(folder));
		}
		return this.titaniumRoots.get(folder);
	}

	/**
	 * Finds the server and a Node that can run it. Checked once, the first time a Titanium file is
	 * opened; a failure is reported once and the built-in providers are used from then on.
	 *
	 * @returns {Object|null} { nodePath, serverPath }, or null when the server can't be run
	 */
	resolveRuntime() {
		if (this.runtime !== undefined) {
			return this.runtime;
		}
		try {
			const { serverPath, nodeRange } = resolveServer(atom.config.get(`${CONFIG_KEY}.serverPath`));
			const nodePath = atom.config.get(`${CONFIG_KEY}.nodePath`) || 'node';
			const version = nodeVersion(nodePath);
			if (!semver.satisfies(version, nodeRange)) {
				throw new Error(`The language server needs Node.js ${nodeRange}, but \`${nodePath}\` is ${version}.`);
			}
			this.runtime = { nodePath, serverPath };
		} catch (error) {
			this.runtime = null;
			this.notifyUnavailable(error);
		}
		return this.runtime;
	}

	notifyUnavailable(error) {
		atom.notifications.addWarning('Titanium Language Server could not start', {
			dismissable: true,
			description: `${error.message}\n\nThe package's built-in autocompletion and go to definition are being used instead. Install a supported version of Node.js, set its path in the package settings, or turn the language server off there to hide this message.`,
			buttons: [ {
				text: 'Open settings',
				onDidClick: () => atom.workspace.open(`atom://config/packages/${PACKAGE_NAME}`)
			} ]
		});
	}
}

/**
 * The server to run, and the Node versions it supports
 *
 * @param {String} [configured] - A server path from the settings, if any
 * @returns {Object} { serverPath, nodeRange }
 */
export function resolveServer(configured) {
	let serverPath;
	if (configured) {
		serverPath = path.resolve(configured);
		if (!fs.existsSync(serverPath)) {
			throw new Error(`The language server path in the settings, \`${serverPath}\`, does not exist.`);
		}
	} else {
		let manifestPath;
		try {
			manifestPath = require.resolve(`${SERVER_PACKAGE}/package.json`);
		} catch (error) {
			throw new Error(`The bundled language server (${SERVER_PACKAGE}) is not installed. Try reinstalling the package.`);
		}
		const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
		const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin && manifest.bin['titanium-language-server'];
		serverPath = path.join(path.dirname(manifestPath), bin || path.join('out', 'server.js'));
	}
	return { serverPath, nodeRange: nodeRangeFor(serverPath) };
}

/**
 * The `engines.node` of the server package a file belongs to
 *
 * @param {String} serverPath - The server's entry point
 * @returns {String} A semver range
 */
function nodeRangeFor(serverPath) {
	let dir = path.dirname(serverPath);
	for (let i = 0; i < 3; i++) {
		const manifestPath = path.join(dir, 'package.json');
		if (fs.existsSync(manifestPath)) {
			try {
				const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
				if (manifest.name === SERVER_PACKAGE) {
					return (manifest.engines && manifest.engines.node) || DEFAULT_NODE_RANGE;
				}
			} catch (error) {
				// not the server's manifest; keep looking
			}
		}
		dir = path.dirname(dir);
	}
	return DEFAULT_NODE_RANGE;
}

/**
 * @param {String} nodePath - The node executable
 * @returns {String} Its version, without the leading v
 */
function nodeVersion(nodePath) {
	let output;
	try {
		output = execFileSync(nodePath, [ '--version' ], { encoding: 'utf8', timeout: 10000, windowsHide: true });
	} catch (error) {
		throw new Error(`Could not run \`${nodePath}\` (${error.code || error.message}). The language server runs on your own installation of Node.js.`);
	}
	const version = semver.clean(output.trim());
	if (!version) {
		throw new Error(`\`${nodePath} --version\` printed "${output.trim()}", which is not a Node.js version.`);
	}
	return version;
}

function isTiapp(filePath) {
	return Boolean(filePath) && path.basename(filePath) === TIAPP_FILENAME;
}

/**
 * @param {String} folder - A project folder
 * @returns {Boolean} Whether it, or a folder directly inside it, has a tiapp.xml
 */
export function findTiapp(folder) {
	if (fs.existsSync(path.join(folder, TIAPP_FILENAME))) {
		return true;
	}
	let entries;
	try {
		entries = fs.readdirSync(folder, { withFileTypes: true });
	} catch (error) {
		return false;
	}
	return entries.some(entry => entry.isDirectory()
		&& !entry.name.startsWith('.')
		&& entry.name !== 'node_modules'
		&& fs.existsSync(path.join(folder, entry.name, TIAPP_FILENAME)));
}
