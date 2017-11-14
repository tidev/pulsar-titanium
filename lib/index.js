'use babel'

import { BufferedProcess, CompositeDisposable, Disposable } from 'atom';
import { platform } from 'os';
import Toolbar from './ui/toolbar';
import Console from './ui/console';
import GenerateDialog from './ui/generateDialog';
import Appc from './appc';
import Tiapp from './tiapp';
import tiappAutoCompleteProvider from './providers/tiappAutoCompleteProvider';
import viewAutoCompleteProvider from './providers/viewAutoCompleteProvider';
import controllerAutoCompleteProvider from './providers/controllerAutoCompleteProvider';
import styleAutoCompleteProvider from './providers/styleAutoCompleteProvider';
import definitionsProvider from './providers/definitionsProvider';
import related from './related';


export default {

    config: {
        general: {
            order: 1,
            type: 'object',
            title: 'General',
            properties: {
                displayBuildCommandInConsole: {
                    type: 'boolean',
                    default: true,
                    title: 'Display build command in console',
                    description: 'The executed build command is written to the console to aid debugging. This will include password arguments.',
                    order: 4,
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
                    default: './dist/',
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
                    default: '\\n".${text}": {\\n}\\n',
                    title: 'Style class (.) template',
                    order: 1,
                },
                tssId: {
                    type: 'string',
                    default: '\\n"#${text}": {\\n}\\n',
                    title: 'Style ID (#) template',
                    order: 2
                },
                tssTag: {
                    type: 'string',
                    default: '\\n"${text}": {\\n}\\n',
                    title: 'Style tag template',
                    order: 3
                },
                jsFunction: {
                    type: 'string',
                    default: '\\nfunction ${text}(e){\\n}\\n',
                    title: 'Event handler function template',
                    order: 4
                }
            }
        },
    },

    provideAutoComplete() {
        return [tiappAutoCompleteProvider, viewAutoCompleteProvider, controllerAutoCompleteProvider, styleAutoCompleteProvider];
    },

    provideDefinitions() {
        return definitionsProvider;
    },

    activate(state) {
        this.serializedState = state;
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(
            
            atom.commands.add('atom-workspace', {
                'appc:build': () => {
                    if (Tiapp.isTitaniumProject) {
                        this.console.clear();
                        this.console.show(true);
                        this.runTi();
                    }
                },
                'appc:stop': () => {
                    this.runProc.kill();
                    this.toolbar.hud.displayDefault();
                    this.toolbar.update({ buildInProgress: false });
                },
                'appc:generate': () => {
                    this.generate();
                },
                'appc:console:toggle': () => {
                    this.console.toggle();
                },
                'appc:open-related-view': () => related.openRelatedFile('xml'),
                'appc:open-related-style': () => related.openRelatedFile('tss'),
                'appc:open-related-controller': () => related.openRelatedFile('js'),
                'appc:open-or-close-related': () => related.toggleAllRelatedFiles(),
                // 'appc:closeRelated': () => related.closeRelatedFiles({forceAllClose: true})
            
            }),

            new Disposable(() => {
                atom.workspace.getPaneItems().forEach(item => {
                    if (item instanceof Toolbar || item instanceof Console) {
                       item.destroy();
                    }
                });
            })
        );
        this.subscriptions.add(atom.project.onDidChangePaths(() => { this.loadProject(); }));

        this.loadProject();

        Tiapp.onModified(() => {
            this.toolbar.hud.display({
                icon: Tiapp.appIcon(),
                text: Tiapp.appName() + ' | ' + Tiapp.sdk(),
                default: true
            });
            this.toolbar.update();
        });
    },

    serialize() {
        return {
            console: this.console.serializedState()
        }
    },

    deactivate() {
        this.toolbar.destroy();
        this.console.destroy();
        this.subscriptions.dispose();
    },

    loadProject() {
        // attempt Titanium project
        Tiapp.load();
        if (Tiapp.isTitaniumProject) {

            if (!this.toolbar) {
                this.toolbar = new Toolbar();
            }
            if (!this.console) {
                this.console = new Console(this.serializedState.console);
            }

            this.toolbar.hud.display({
                icon: Tiapp.appIcon(),
                text: Tiapp.appName() + ' | ' + Tiapp.sdk(),
                default: true
            });

            this.toolbar.hud.display({
                text: 'Preparing...',
                spinner: true
            });
            setTimeout(function () { // yuck
                Appc.getInfo(function () {
                    if (platform() === 'darwin') {
                        this.toolbar.populateiOSTargets();
                    } else {
                        this.toolbar.populateAndroidTargets();
                    }
                    // this.toolbar.populateWindowsTargets();

                    this.toolbar.update({ disableUI: false });
                    this.toolbar.hud.displayDefault();
                }.bind(this));
            }.bind(this), 1000);

            return;
        }
    },

    runTi() {
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
                '--project-dir', atom.project.getPaths()[0],
                '--target', targetType,
                '--device-id', target,
                '--log-level', logLevel
            ];

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

            if (!iOSCodeSigning.certificate || !iOSCodeSigning.provisioningProfile) {
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
                '--output-dir', atom.config.get('appcelerator-titanium.build.distributionOutputDirectory'),
                '--log-level', logLevel
            ];

            message = (buildCommand === 'dist-adhoc') ? 'iOS ad-hoc' : 'iOS distribution';

        } else if (buildCommand === 'dist-appstore' && platform === 'android') {

            if (!androidKeystore.path || !androidKeystore.alias || !androidKeystore.password) {
                atom.notifications.addError('Android keystore information required', { detail: 'Please provide keystore path, alias and password.' });
                return;
            }

            args = [
                '--platform', platform.value,
                '--project-dir', atom.project.getPaths()[0],
                '--target', 'dist-playstore',
                '--output-dir', atom.config.get('appcelerator-titanium.build.distributionOutputDirectory'),
                '--keystore', androidKeystore.path,
                '--store-password', androidKeystore.password,
                '--alias', androidKeystore.alias,
                '--log-level', logLevel
            ];

            if (androidKeystore.privateKeyPassword) {
                args.push('--key-password', androidKeystore.privateKeyPassword);
            }

            message = 'Android distribution';

        } else if (buildCommand === 'custom') {
            console.log(customArgs);
            args = customArgs.split(' ').concat(['--project-dir', atom.project.getPaths()[0]]);
        }

        const options = {
            args: args,
            log: (text) => {
                this.console.write(text);
                if (text.indexOf('Start simulator log') != -1 || text.indexOf('Start application log') != -1) {
                    this.toolbar.hud.display({
                        text: `Running on ${message}`
                    });
                }
            },
            error: (text) => {
                this.console.write(text);
            },
            exit: (code) => {
                if (code != 0) {
                    this.console.error(`Build failed. Process exited with code ${code}.`);
                }
                this.toolbar.hud.displayDefault();
                this.toolbar.update({ buildInProgress: false });
            }

        };

        this.toolbar.hud.display({
            text: `Building for ${message}`,
            spinner: true
        });
        if (atom.config.get('appcelerator-titanium.general.displayBuildCommandInConsole')) {
            this.console.write('appc run ' + options.args.join(' '));
        }
        this.runProc = Appc.run(options);
        this.toolbar.update({ buildInProgress: true });
    },

    generate() {
        let generateDialogPanel;
        this.generateDialog = new GenerateDialog({
            cancel: () => {
                generateDialogPanel.destroy();
            },
            generate: (type, name) => {
                Appc.generate({
                    type,
                    name,
                    error: (err) => { atom.notifications.addError(err.message, err) }
                });
                generateDialogPanel.destroy();
            }
        });
        generateDialogPanel = atom.workspace.addModalPanel({item: this.generateDialog});
    }
}
