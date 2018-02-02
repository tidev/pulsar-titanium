'use babel';

import { CompositeDisposable, Disposable } from 'atom';
import os from 'os';
import path from 'path';
import Toolbar from './ui/toolbar';
import Console from './ui/console';
import GenerateDialog from './ui/generateDialog';
import NewProjectDialog from './ui/newProjectDialog';
import Appc from './appc';
import Project from './project';
import Utils from './utils';
import autoCompleteHelper from './providers/autoCompleteHelper';
import tiappAutoCompleteProvider from './providers/tiappAutoCompleteProvider';
import viewAutoCompleteProvider from './providers/viewAutoCompleteProvider';
import controllerAutoCompleteProvider from './providers/controllerAutoCompleteProvider';
import styleAutoCompleteProvider from './providers/styleAutoCompleteProvider';
import definitionsProvider from './providers/definitionsProvider';
import related from './related';

export default {

	/**
	 * Package configuration - displayed in package settings
	 */
	config: {
		general: {
			order: 1,
			type: 'object',
			title: 'General',
			properties: {
				appcCommandPath: {
					type: 'string',
					default: 'appc',
					title: 'Path to \'appc\' command',
					description: 'Set the full path to the `appc` command if Atom is unable to locate it. NOTE: Requires relaunch.',
					order: 1
				},
				displayBuildCommandInConsole: {
					type: 'boolean',
					default: true,
					title: 'Display build command in console',
					description: 'The executed build command is written to the console to aid debugging. This will include password arguments.',
					order: 2
				},
				generateAutoCompleteSuggestions: {
					type: 'boolean',
					default: false,
					title: 'Regenerate auto-complete suggestions',
					description: 'Generate auto-complete suggestions for currently selected Titanium SDK. NOTE: Requires relaunch.',
					order: 3
				}
			}
		},
		project: {
			order: 2,
			type: 'object',
			title: 'Project',
			properties: {
				defaultI18nLanguage: {
					type: 'string',
					default: 'en',
					title: 'Default language for i18n auto-completion',
					order: 5
				}
			}
		},
		build: {
			order: 3,
			type: 'object',
			title: 'Build',
			properties: {
				distributionOutputDirectory: {
					type: 'string',
					default: 'dist',
					title: 'Distribution build output directory',
					description: 'For iOS ad-hoc and App Store and Google Play builds. Ensure this location has write permission.',
					order: 3
				}
			}
		},
		codeTemplates: {
			order: 4,
			type: 'object',
			title: 'Code Templates',
			properties: {
				tssClass: {
					type: 'string',
					default: '\\n\'.${text}\': {\\n}\\n', // eslint-disable-line no-template-curly-in-string
					title: 'Style class (.) template',
					order: 1,
				},
				tssId: {
					type: 'string',
					default: '\\n\'#${text}\': {\\n}\\n', // eslint-disable-line no-template-curly-in-string
					title: 'Style ID (#) template',
					order: 2
				},
				tssTag: {
					type: 'string',
					default: '\\n\'${text}\': {\\n}\\n', // eslint-disable-line no-template-curly-in-string
					title: 'Style tag template',
					order: 3
				},
				jsFunction: {
					type: 'string',
					default: '\\nfunction ${text}(e){\\n}\\n', // eslint-disable-line no-template-curly-in-string
					title: 'Event handler function template',
					order: 4
				}
			}
		},
		android: {
			order: 5,
			type: 'object',
			title: 'Android',
			properties: {
				keystorePath: {
					order: 1,
					type: 'string',
					default: '',
					title: 'Keystore path'
				},
				keystoreAlias: {
					order: 2,
					type: 'string',
					default: '',
					title: 'Keystore alias'
				}
			}
		}
	},

	/**
	 * Auto-complete provider(s)
	 *
	 * @returns {Array}
	 */
	provideAutoComplete() {
		return [ tiappAutoCompleteProvider, viewAutoCompleteProvider, controllerAutoCompleteProvider, styleAutoCompleteProvider ];
	},

	/**
	 * Click-to-definition provider(s)
	 *
	 * @returns {Object}
	 */
	provideDefinitions() {
		return definitionsProvider;
	},

	/**
	 * Activate package - called when package is initialized
	 *
	 * @param {Object} state 		serialized state
	 */
	activate(state) {
		this.serializedState = state;
		this.disposable = new CompositeDisposable();
		this.projectDisposable = new CompositeDisposable();

		this.loadProject();

		this.disposable.add(
			atom.commands.add('atom-workspace', {
				'appc:new': () => {
					this.openNewProjectDialog();
				}
			}),
			atom.menu.add([ {
				label: 'Packages',
				submenu: [ {
					label: 'Appcelerator Titanium',
					submenu: [ {
						label: 'New Titanium Project...',
						command: 'appc:new'
					} ]
				} ]
			} ]),
			atom.project.onDidChangePaths(() => {
				this.loadProject();
			})
		);
		atom.menu.update();

		Project.onModified(() => {
			this.toolbar.hud.display({
				icon: Project.appIcon(),
				text: Project.appName() + ' | ' + Project.sdk(),
				default: true
			});
			this.toolbar.update();
		});
	},

	/**
	 * Deactivate package - called when package is disabled
	 */
	deactivate() {
		this.toolbar.destroy();
		this.console.destroy();
		this.disposable.dispose();
		this.projectDisposable.dispose();
	},

	/**
	 * Serialized state of package
	 *
	 * @returns {Object}
	 */
	serialize() {
		return {
			console: (this.console) ? this.console.serializedState() : {}
		};
	},

	/**
	 * Load titanium project
	 */
	loadProject() {
		Project.load();
		if (Project.isTitaniumApp || Project.isTitaniumModule) {
			this.projectDisposable.add(
				atom.commands.add('atom-workspace', {
					'appc:build': () => {
						if (Project.isTitaniumApp || Project.isTitaniumModule) {
							this.runBuildCommand();
						}
					},
					'appc:stop': () => {
						this.stopBuildCommand();
					},
					'appc:console:toggle': () => {
						this.console.toggle();
					}
				}),

				atom.workspace.observeTextEditors(editor => {
					if (editor.getPath() && path.basename(editor.getPath()) === 'tiapp.xml') {
						const grammar = atom.grammars.grammarForScopeName('text.xml');
						editor.setGrammar(grammar);
					}
				}),

				new Disposable(() => {
					atom.workspace.getPaneItems().forEach(item => {
						if (item instanceof Toolbar || item instanceof Console) {
							item.destroy();
						}
					});
				}),
			);

			let keymap;
			let menu;
			if (Project.isTitaniumApp) {
				keymap = require('./keymap/app');
				menu = require('./menu/app');
				this.projectDisposable.add(
					atom.commands.add('atom-workspace', {
						'appc:generate': () => {
							this.openGenerateDialog();
						},
						'appc:open-related-view': () => related.openRelatedFile('xml'),
						'appc:open-related-style': () => related.openRelatedFile('tss'),
						'appc:open-related-controller': () => related.openRelatedFile('js'),
						'appc:open-or-close-related': () => related.toggleAllRelatedFiles(),
						// 'appc:closeRelated': () => related.closeRelatedFiles({forceAllClose: true})
					})
				);
			} else {
				keymap = require('./keymap/module');
				menu = require('./menu/module');
			}
			this.projectDisposable.add(
				atom.keymaps.add('appcelerator-titanium', keymap),
				atom.menu.add(menu.items)
			);

			if (!this.toolbar) {
				this.toolbar = new Toolbar();
			}
			if (!this.console) {
				this.console = new Console(this.serializedState.console);
			}

			const text = (Project.isTitaniumApp) ? `${Project.appName()} | ${Project.sdk()}` : `${Project.appName()} | ${Project.platforms().map(platform => Utils.nameForPlatform(platform)).join(', ')}`;
			this.toolbar.hud.display({
				icon: Project.appIcon(),
				text: text,
				default: true
			});

			this.toolbar.hud.display({
				text: 'Preparing...',
				spinner: true
			});
			setTimeout(() => { // yuck
				Appc.getInfo(() => {
					autoCompleteHelper.generateAutoCompleteSuggestions();

					if (os.platform() === 'darwin') {
						this.toolbar.populateiOSTargets();
					} else {
						this.toolbar.populateAndroidTargets();
					}
					this.toolbar.update({ disableUI: false });
					this.toolbar.hud.displayDefault();
				});
			}, 1000);
		} else {
			if (this.toolbar) {
				this.toolbar.destroy();
				this.toolbar = null;
			}
			if (this.console) {
				this.console.destroy();
				this.console = null;
			}

			atom.keymaps.removeBindingsFromSource('appcelerator-titanium');

			const menu = require('./menu/app');
			atom.menu.remove(menu.items);

			this.projectDisposable.dispose();
			this.projectDisposable = new CompositeDisposable();
		}

		atom.menu.update();
	},

	/**
	 * Run selected build command
	 */
	runBuildCommand() {
		if ((!Project.isTitaniumApp && !Project.isTitaniumModule) || this.checkLoginAndPrompt()) {
			return;
		}

		const {
			buildCommand,
			platform,
			platformName,
			target,
			targetName,
			targetType,
			iOSCodeSigning,
			androidKeystore,
			customArgs
		} = this.toolbar.getState();
		const logLevel = this.console.getLogLevel();
		let message;

		let args = {};
		if (buildCommand === 'run') {
			args = [
				'--platform', platform,
				'--target', targetType,
				'--log-level', logLevel
			];

			const projectPath = (Project.isTitaniumApp) ? atom.project.getPaths()[0] : Project.pathForPlatform(platform);
			args.push('--project-dir', projectPath);

			if (targetType !== 'ws-local') {
				args.push('--device-id', target);
			}

			if (targetType === 'device' && platform === 'ios') {

				if (!iOSCodeSigning.certificate || !iOSCodeSigning.provisioningProfile) {
					atom.notifications.addError('iOS code signing required', { detail: 'Please select a certificate and provisioning profile.' });
					this.toolbar.expand();
					return;
				}

				args = args.concat([
					'--developer-name', iOSCodeSigning.certificate,
					'--pp-uuid', iOSCodeSigning.provisioningProfile
				]);
			}

			message = `${platformName} ${targetType} ${targetName}`;

		} else if (buildCommand === 'dist-adhoc' || buildCommand === 'dist-appstore' && platform === 'ios') {

			if (!iOSCodeSigning.certificate || !iOSCodeSigning.provisioningProfile || iOSCodeSigning.provisioningProfile === '-') {
				atom.notifications.addError('iOS code signing required', { detail: 'Please select a certificate and provisioning profile.' });
				this.toolbar.expand();
				return;
			}

			args = [
				'--platform', platform,
				'--project-dir', atom.project.getPaths()[0],
				'--target', buildCommand,
				'--distribution-name', iOSCodeSigning.certificate,
				'--pp-uuid', iOSCodeSigning.provisioningProfile,
				'--output-dir', Utils.distributionOutputDirectory(),
				'--log-level', logLevel
			];

			message = (buildCommand === 'dist-adhoc') ? 'iOS ad-hoc' : 'iOS distribution';

		} else if (buildCommand === 'dist-appstore' && platform === 'android') {

			if (!androidKeystore.path || !androidKeystore.alias || !androidKeystore.password) {
				atom.notifications.addError('Android keystore information required', { detail: 'Please provide keystore path, alias and password.' });
				this.toolbar.expand();
				return;
			}

			args = [
				'--platform', platform,
				'--project-dir', atom.project.getPaths()[0],
				'--target', 'dist-playstore',
				'--output-dir', Utils.distributionOutputDirectory(),
				'--keystore', androidKeystore.path,
				'--store-password', androidKeystore.password,
				'--alias', androidKeystore.alias,
				'--log-level', logLevel
			];

			if (androidKeystore.privateKeyPassword) {
				args.push('--key-password', androidKeystore.privateKeyPassword);
			}

			message = 'Android distribution';

		} else if (buildCommand === 'build') {
			args = [
				'--platform', platform,
				'--project-dir', Project.pathForPlatform(platform),
				'--log-level', logLevel,
				'--build-only'
			];

		} else if (buildCommand === 'custom') {
			args = customArgs.split(' ').concat([ '--project-dir', atom.project.getPaths()[0] ]);
		}

		const options = {
			args: args,
			log: (text) => {
				this.console.write(text);
				if (text.indexOf('Start simulator log') !== -1 || text.indexOf('Start application log') !== -1) {
					this.toolbar.hud.display({
						text: (buildCommand === 'custom') ? 'Running...' : `Running on ${message}`
					});
				}
				if (text.indexOf('Appcelerator Login required to continue') !== -1) {
					this.stopBuildCommand();
					this.checkLoginAndPrompt();
				}
			},
			error: (text) => {
				this.console.write(text);
			},
			exit: (code) => {
				if (code !== 0) {
					this.console.error(`Build failed. Process exited with code ${code}.`);
				}
				this.toolbar.hud.displayDefault();
				this.toolbar.update({ buildInProgress: false });
			}
		};

		this.console.clear();
		this.console.show(true);
		this.toolbar.hud.display({
			text: (buildCommand === 'custom') ? 'Building...' : `Building for ${message}`,
			spinner: true
		});
		if (atom.config.get('appcelerator-titanium.general.displayBuildCommandInConsole')) {
			this.console.write(`appc run ${options.args.join(' ')}`);
		}
		this.runProc = Appc.run(options);
		this.toolbar.update({ buildInProgress: true });
	},

	/**
	 * Stop build command
	 */
	stopBuildCommand() {
		if (!Project.isTitaniumApp && !Project.isTitaniumModule) {
			return;
		}
		this.runProc.kill();
		this.toolbar.hud.displayDefault();
		this.toolbar.update({ buildInProgress: false });
	},

	/**
	 * Display generate dialog
	 */
	openGenerateDialog() {
		if (!Project.isTitaniumApp) {
			return;
		}
		let generateDialogPanel;
		this.generateDialog = new GenerateDialog({
			cancel: () => {
				generateDialogPanel.destroy();
			},
			generate: (type, args) => {
				Appc.generate({
					type,
					args,
					error: (err) => atom.notifications.addError(err.message, err)
				});
				generateDialogPanel.destroy();
			}
		});
		generateDialogPanel = atom.workspace.addModalPanel({ item: this.generateDialog });
	},

	/**
	 * Display new project dialog
	 */
	openNewProjectDialog() {
		if (this.checkLoginAndPrompt()) {
			return;
		}

		let newProjectDialogPanel;
		this.newProjectDialog = new NewProjectDialog({
			cancel: () => {
				newProjectDialogPanel.destroy();
			},
			callback: (args) => {
				args.callback = () => {
					newProjectDialogPanel.destroy();
				};
				Appc.new(args);
			}
		});
		newProjectDialogPanel = atom.workspace.addModalPanel({ item: this.newProjectDialog });
	},

	/**
	 * Check user is logged in and displays prompt if required. Returns true is prompted.
	 *
	 * @returns {Boolean}
	 */
	checkLoginAndPrompt() {
		if (!Appc.isUserLoggedIn()) {
			const terminal = (os.platform() === 'win32') ? 'Command Prompt' : 'Terminal';
			atom.notifications.addError('Appcelerator Login Required', {
				detail: `Open ${terminal} and run \`appc login\` command`,
				dismissable: true
			});
			return true;
		}
	}
};
