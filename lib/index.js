'use babel';

import { CompositeDisposable, Disposable } from 'atom';
import { remote } from 'electron';

import { exec } from 'child_process';
import os from 'os';
import path from 'path';
import Toolbar from './ui/toolbar.jsx';
import Console from './ui/console.jsx';
import GenerateDialog from './ui/generateDialog.jsx';
import NewProjectDialog from './ui/newProjectDialog.jsx';
import UpdatesDialog from './ui/updatesDialog.jsx';
import Appc from './appc';
import Project from './project';
import Update from './update';
import Utils from './utils';
import autoCompleteHelper from './providers/autoCompleteHelper';
import tiappAutoCompleteProvider from './providers/tiappAutoCompleteProvider';
import viewAutoCompleteProvider from './providers/viewAutoCompleteProvider';
import controllerAutoCompleteProvider from './providers/controllerAutoCompleteProvider';
import styleAutoCompleteProvider from './providers/styleAutoCompleteProvider';
import definitionsProvider from './providers/definitionsProvider';
import related from './related';
import { environment } from 'titanium-editor-commons';
import TouchBarManager from './touchBarManager';

const { BrowserWindow, TouchBar, nativeImage } = remote;
const { TouchBarButton, TouchBarLabel } = TouchBar;

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
				screenshotPath: {
					type: 'string',
					default: os.homedir(),
					title: 'Path to store screenshots',
					description: 'Set the full path where the screenshots are stored.',
					order: 2
				},
				displayBuildCommandInConsole: {
					type: 'boolean',
					default: true,
					title: 'Display build command in console',
					description: 'The executed build command is written to the console to aid debugging. This will include password arguments.',
					order: 3
				},
				showToolbar: {
					type: 'boolean',
					default: true,
					title: 'Show Titanium SDK toolbar',
					description: 'Show or hide the Titanium SDK top toolbar with all menu buttons.',
					order: 5
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
					label: 'Titanium SDK',
					submenu: [ {
						type: 'separator'
					}, {
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
			if (!this.toolbar) {
				return;
			}

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
		this.toolbar && this.toolbar.destroy();
		this.console && this.console.destroy();
		this.disposable.dispose();
		this.projectDisposable.dispose();

		if (Project.isTitaniumApp) {
			BrowserWindow.getFocusedWindow().setTouchBar(null);
		}
	},

	/**
	 * Serialized state of package
	 *
	 * @returns {Object}
	 */
	serialize() {
		return {
			console: this.console ? this.console.serializedState() : {}
		};
	},

	/**
	 * Load titanium project
	 */
	async loadProject() {
		Project.load();
		if (Project.isTitaniumApp || Project.isTitaniumModule) {
			this.configureTouchBar();

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
					},
					'appc:clean': () => {
						if (Project.isTitaniumApp || Project.isTitaniumModule) {
							this.runCleanCommand();
						}
					},
					'appc:toolbar:toggle': {
						displayName: 'Appc: Toggle Toolbar',
						didDispatch: () => {
							if (!this.toolbar) {
								return;
							}
							this.toolbar.toggle();
						}
					},
					'appc:update:refresh': () => {
						this.checkForUpdates();
					},
					'appc:generate-completions': () => {
						autoCompleteHelper.generateAutoCompleteSuggestions({ force: true });
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
						'appc:generate': () => this.openGenerateDialog(),
						'appc:open-related-view': () => related.openRelatedFile('xml'),
						'appc:open-related-style': () => related.openRelatedFile('tss'),
						'appc:open-related-controller': () => related.openRelatedFile('js'),
						'appc:open-or-close-related': () => related.toggleAllRelatedFiles(),
						'appc:take-screenshot': () => this.takeScreenshot(),
						'appc:updates': () => this.openUpdatesDialog(),
						// 'appc:closeRelated': () => related.closeRelatedFiles({forceAllClose: true})
					})
				);

				// add contect menu
				atom.contextMenu.add({
					'atom-workspace': [
						{ label: 'Open related view', command: 'appc:open-related-view', shouldDisplay: () => this.checkShouldDisplay('xml') },
						{ label: 'Open related style', command: 'appc:open-related-style', shouldDisplay: () => this.checkShouldDisplay('tss') },
						{ label: 'Open related controller', command: 'appc:open-related-controller', shouldDisplay: () => this.checkShouldDisplay('js') },
						{ label: 'Open/Close all related', command: 'appc:open-or-close-related', shouldDisplay: () => this.checkShouldDisplay('') }
					]
				});
			} else {
				keymap = require('./keymap/module');
				menu = require('./menu/module');
			}
			this.projectDisposable.add(
				atom.keymaps.add('titanium', keymap),
				atom.menu.add(menu.items)
			);

			if (!this.toolbar) {
				this.toolbar = new Toolbar();
			}
			if (!this.console) {
				this.console = new Console(this.serializedState.console);
			}

			atom.config.onDidChange('titanium.general.showToolbar', () => {
				this.toolbar.toggle();
			});

			const setHud = () => {
				const text = (Project.isTitaniumApp) ? `${Project.appName()} | ${Project.sdk()}` : `${Project.appName()} | ${Project.platforms().map(platform => Utils.nameForPlatform(platform)).join(', ')}`;
				this.toolbar.hud.display({
					icon: Project.appIcon(),
					text: text,
					default: true
				});
			};

			setHud();

			await this.prepare();

		} else {
			if (this.toolbar) {
				this.toolbar.destroy();
				this.toolbar = null;
			}
			if (this.console) {
				this.console.destroy();
				this.console = null;
			}

			atom.keymaps.removeBindingsFromSource('titanium');

			const menu = require('./menu/app');
			atom.menu.remove(menu.items);

			this.projectDisposable.dispose();
			this.projectDisposable = new CompositeDisposable();
		}

		atom.menu.update();
	},

	configureTouchBar() {
		this.touchBar = new TouchBarManager();

		this.touchBar.addItem({
			label: 'build',
			tbItem: new TouchBarButton({
				icon: nativeImage.createFromNamedImage('NSTouchBarPlayTemplate', [ -1, 0, 1 ]),
				click: () => {
					atom.commands.dispatch(atom.views.getView(atom.workspace), 'appc:build');
				}
			}),
			place: 1
		});

		this.touchBar.addItem({
			label: 'clean',
			tbItem: new TouchBarButton({
				icon: nativeImage.createFromNamedImage('NSTouchBarDeleteTemplate', [ -1, 0, 1 ]),
				click: () => {
					atom.commands.dispatch(atom.views.getView(atom.workspace), 'appc:clean');
				}
			}),
			place: 2
		});

		if (Utils.isAlloyProject()) {
			this.touchBar.addItem({
				tbItem: new TouchBarButton({
					label: 'Open Related',
					click: () => {
						const existingItems = this.touchBar.items;
						const addBackItems = () => {
							this.touchBar.addItems(existingItems);
						};
						const editor = atom.workspace.getActiveTextEditor();
						if (!editor || !editor.getPath()) {
							const item = {
								tbItem: new TouchBarLabel({
									label: 'No related items to open',
									textColor: '#ffc107'
								})
							};

							setTimeout(addBackItems, 1500);
							this.touchBar.addItems([ item ]);
							return;
						}
						const items = [
							{
								label: 'all',
								tbItem: new TouchBarButton({
									label: 'All',
									click: () => {
										atom.commands.dispatch(atom.views.getView(atom.workspace), 'appc:open-or-close-related');
										addBackItems();
									}
								}),
								place: 1
							},
							{
								label: 'controller',
								tbItem: new TouchBarButton({
									label: 'Controller',
									click: () => {
										atom.commands.dispatch(atom.views.getView(atom.workspace), 'appc:open-related-controller');
										addBackItems();

									}
								}),
								place: 1
							},
							{
								label: 'style',
								tbItem: new TouchBarButton({
									label: 'Style',
									click: () => {
										atom.commands.dispatch(atom.views.getView(atom.workspace), 'appc:open-related-style');
										addBackItems();

									}
								}),
								place: 2
							},
							{
								label: 'view',
								tbItem: new TouchBarButton({
									label: 'View',
									click: () => {
										atom.commands.dispatch(atom.views.getView(atom.workspace), 'appc:open-related-view');
										addBackItems();
									}
								}),
								place: 3
							}
						];
						switch (path.extname(editor.getPath())) {
							case '.js':
								items.splice(1, 1);
								break;
							case '.tss':
								items.splice(2, 1);
								break;
							case '.xml':
								items.splice(3, 1);
								break;
						}
						this.touchBar.addItems(items);
						this.touchBar.setEscape(new TouchBarButton({
							label: 'Back',
							click: addBackItems
						}));
					}
				}),
				place: 3
			});
		}
	},

	/**
	 * Run selected build command
	 */
	async runBuildCommand() {
		if ((!Project.isTitaniumApp && !Project.isTitaniumModule)) {
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
			customArgs,
			enableLiveview,
			isDebugMode
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

			if (enableLiveview) {
				args.push('--liveview');
			}

			if (isDebugMode) {
				args.push('--debug-host', 'localhost:8989');
			}

			const projectPath = (Project.isTitaniumApp) ? atom.project.getPaths()[0] : Project.pathForPlatform(platform);
			args.push('--project-dir', projectPath);
			args.push('--device-id', target);

			if (targetType === 'device' && platform === 'ios') {
				const certificateName = Utils.getCorrectCertificateName(iOSCodeSigning.certificate, Project.sdk()[0], 'developer');
				if (!certificateName || !iOSCodeSigning.provisioningProfile) {
					atom.notifications.addError('iOS code signing required', { detail: 'Please select a certificate and provisioning profile.' });
					this.toolbar.expand();
					return;
				}

				args.push(
					'--developer-name', certificateName,
					'--pp-uuid', iOSCodeSigning.provisioningProfile
				);
			}

			message = `${platformName} ${targetType} ${targetName}`;

		} else if (buildCommand === 'dist-adhoc' || buildCommand === 'dist-appstore' && platform === 'ios') {
			const certificateName = Utils.getCorrectCertificateName(iOSCodeSigning.certificate, Project.sdk()[0], 'distribution');
			if (!certificateName || !iOSCodeSigning.provisioningProfile || iOSCodeSigning.provisioningProfile === '-') {
				atom.notifications.addError('iOS code signing required', { detail: 'Please select a certificate and provisioning profile.' });
				this.toolbar.expand();
				return;
			}

			args = [
				'--platform', platform,
				'--project-dir', atom.project.getPaths()[0],
				'--target', buildCommand,
				'--distribution-name', certificateName,
				'--pp-uuid', iOSCodeSigning.provisioningProfile,
				'--log-level', logLevel
			];

			if (iOSCodeSigning.output !== 'xcode') {
				args.push('--output-dir', Utils.distributionOutputDirectory());
			}

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

			// For custom args, check if the option was already appended previously and let the dev
			// know that migration is recommended
			if (enableLiveview) {
				if (args.indexOf('--liveview') !== -1) {
					atom.notifications.addError('Duplicate \'--liveview\' option', {
						detail: 'LiveView option \'--liveview\' already appended by custom arguments, but enabled via UI as well. Skipping duplicate argument ...',
						dismissable: true
					});
				} else {
					args.push('--liveview');
				}
			}
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
		if (Utils.get('general.displayBuildCommandInConsole')) {
			this.console.write('ti build ' + options.args.join(' '));
		}
		this.runProc = Appc.run(options);
		this.toolbar.update({ buildInProgress: true });
		if (this.touchBar) {
			this.touchBar.replaceItem({
				label: 'stop',
				tbItem: new TouchBarButton({
					icon: nativeImage.createFromNamedImage('NSTouchBarRecordStopTemplate', [ -1, 0, 1 ]),
					click: () => {
						atom.commands.dispatch(atom.views.getView(atom.workspace), 'appc:stop');
					}
				}),
				toReplace: 'build'
			});
		}
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

		if (this.touchBar) {
			this.touchBar.replaceItem({
				label: 'build',
				tbItem: new TouchBarButton({
					icon: nativeImage.createFromNamedImage('NSTouchBarPlayTemplate', [ -1, 0, 1 ]),
					click: () => {
						atom.commands.dispatch(atom.views.getView(atom.workspace), 'appc:build');
					}
				}),
				toReplace: 'stop'
			});
		}
	},

	/**
	 * Stop build command
	 */
	runCleanCommand() {
		if (!Project.isTitaniumApp && !Project.isTitaniumModule) {
			return;
		}
		const options = {
			args: {},
			log: (text) => {
				this.console.write(text);
			},
			error: (text) => {
				this.console.write(text);
			},
			exit: () => {
				this.toolbar.hud.displayDefault();
				this.toolbar.update({ buildInProgress: false });
			}
		};
		this.console.clear();
		this.console.show(true);
		this.console.write('ti clean');
		this.runProc = Appc.clean(options);
		this.toolbar.update({ buildInProgress: true });
	},

	/**
	 * Take a screenshot of a device/simulator/emulator
	 */
	takeScreenshot() {
		// If the UI is not ready, abort!
		if (this.toolbar.state.disableUI) {
			atom.notifications.addError('Please wait until the tooling has finished processing and try again!');
			return;
		}

		// If the build command is not "run" or "custom", abort!
		if (this.toolbar.state.buildCommand !== 'run' && this.toolbar.state.buildCommand !== 'custom') {
			atom.notifications.addError('Screenshots can only be taken for the "Run" or "Custom" configuration');
			return;
		}

		const filename = path.join(Utils.get('appcelerator-titanium.general.screenshotPath'), 'screenshot_' + new Date().getTime() + '.png');
		const hasAndroidDevices = (Appc.info.android.devices && Appc.info.android.devices.length > 0) || (Appc.info.android.emulators && Appc.info.android.emulators.length > 0);

		// macOS is the only platform that can take build for iOS. Use it if the target platform is "ios"
		if (os.platform() === 'darwin' && this.toolbar.state.platform === 'ios') {
			// iOS
			exec('xcrun simctl io booted screenshot  ' + filename, (error, stdout, stderr) => {
				if (error) {
					atom.notifications.addError(`Cannot save iOS screenshot: ${stderr}`);
					return;
				}
				atom.notifications.addSuccess(`iOS screenshot saved to: ${filename}`);
			});
		}

		// Android screenshots can be taken is the target platform is "android" and there are devices available
		if (this.toolbar.state.platform === 'android' && hasAndroidDevices) {
			// Android
			exec('adb shell /system/bin/screencap -p > ' + filename, (error, stdout, stderr) => {
				if (error) {
					atom.notifications.addError(`Cannot save Android screenshot: ${stderr}`);
					return;
				}
				atom.notifications.addSuccess(`Android screenshot saved to: ${filename}`);
			});
		}
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
	async openNewProjectDialog() {
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
	 * Display Updates dialog
	 */
	openUpdatesDialog() {
		let updatesDialogPanel;
		this.updatesDialog = new UpdatesDialog({
			cancel: () => {
				updatesDialogPanel.destroy();
			},
			install: async (type, args) => {
				updatesDialogPanel.destroy();
				await Update.installUpdates(args, this.toolbar, true);
				this.toolbar.hud.displayDefault();

			}
		});
		updatesDialogPanel = atom.workspace.addModalPanel({ item: this.updatesDialog });
	},

	async checkForUpdates() {
		const details = await Update.refresh();
		if (details) {
			this.toolbar.hud.update({
				updates: true,
				updateInfo: details
			});
			return details;
		}
	},

	checkShouldDisplay(type) {
		const editor = atom.workspace.getActiveTextEditor();
		if (editor && editor.getPath()) {
			return path.parse(editor.getPath()).ext.substr(1) !== type;
		} else {
			return false;
		}
	},

	async prepare () {

		this.toolbar.update({ disableUI: true });

		this.toolbar.hud.display({
			text: 'Preparing...',
			spinner: true
		});

		const setupTargets = () => {
			// It's possible that the plugin has been unloaded as the folder was removed whilst
			// we were running appc info. So check for the existence of the toolbar and return
			if (!this.toolbar) {
				return;
			}
			autoCompleteHelper.generateAutoCompleteSuggestions();
			this.toolbar.refreshTargets();
			this.toolbar.update({ disableUI: false });
			this.toolbar.hud.displayDefault();
			this.checkForUpdates();
		};

		const { missing } = await environment.validateEnvironment(undefined);

		if (missing.length) {
			let message = 'You are missing the following required components for Titanium development:';
			for (let i = 0; i < missing.length; i++) {
				const product = missing[i];
				if (i < missing.length - 1) {
					message = `${message} ${product.name},`;
				} else {
					message = `${message} ${product.name}`;
				}
			}
			message = `${message}. Without these components the package will be unusable.`;

			const errorNotification = atom.notifications.addError(message, {
				buttons: [
					{
						onDidClick: async () => {
							errorNotification.dismiss();
							const updateInfo = [];
							for (const product of missing) {
								updateInfo.push(await product.getInstallInfo());
							}
							await Update.installUpdates(updateInfo, this.toolbar);
							Appc.getInfo(() => {
								setupTargets();
							});
						},
						text: 'Install'
					}
				],
				dismissable: true,
			});

			this.toolbar.hud.display({
				text: 'You are missing required tooling'
			});
		} else {
			Appc.getInfo(() => {
				setupTargets();
			});
		}
	}
};
