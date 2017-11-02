'use babel'

import { BufferedProcess, CompositeDisposable } from 'atom';
import {platform} from 'os';
import Toolbar from './ui/toolbar';
import Console from './ui/console';
import Appc from './appc';
import Tiapp from './tiapp';
import tiappAutoCompleteProvider from './providers/tiappAutoCompleteProvider';
import viewAutoCompleteProvider from './providers/viewAutoCompleteProvider';
import controllerAutoCompleteProvider from './providers/controllerAutoCompleteProvider';
import styleAutoCompleteProvider from './providers/styleAutoCompleteProvider';
import related from './related';

export default {

    config: {
        showToolbar: {
            type: 'boolean',
            default: true,
            title: 'Show toolbar',
            order: 1
        },
        autoCompleteRebuild: {
            type: 'boolean',
            default: false,
            title: 'Rebuild auto-complete index',
            description: 'Select this option and restart Atom to rebuild the auto-complete index.',
            order: 2
        },
        distributionOutputDirectory: {
            type: 'string',
            default: './dist/',
            title: 'Distribution build output directory',
            description: 'For iOS ad-hoc and App Store and Google Play builds. Ensure this location has write permission.',
            order: 3
        },
        displayBuildCommandInConsole: {
            type: 'boolean',
            default: true,
            title: 'Display build command in console',
            description: 'The executed build command is written to the console to aid debugging. This will include password arguments.',
            order: 4,
        },
        defaultI18nLanguage: {
            type: 'string',
            default: 'en',
            title: 'Default language for i18n auto-completion',
            order: 5
        }
    },

    subscriptions: null,

    autoCompleteProvider() {
        return [tiappAutoCompleteProvider, viewAutoCompleteProvider, controllerAutoCompleteProvider, styleAutoCompleteProvider];
    },

    activate() {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'appc:build': () => {
                if (Tiapp.isTitaniumProject) {
                    this.console.clear();
                    this.console.show();
                    this.runTi();
                }
            },
            'appc:stop': () => {
                this.runProc.kill();
                this.toolbar.hud.displayDefault();
                this.toolbar.update({buildInProgress:false});
            },
            'appc:generate': () => { 
                this.createController(); 
            },
            'appc:console:toggle': () => {
                if (this.console.isShowing) {
                    this.console.hide();
                } else {
                    this.console.show();
                }
            }, 
            'appc:open related view': () => related.openRelatedFile('xml'),
            'appc:open related style': () => related.openRelatedFile('tss'),
            'appc:open related controller': () => related.openRelatedFile('js'),
            'appc:open or close related': () => related.toggleAllRelatedFiles()
            // 'appc:closeRelated': () => related.closeRelatedFiles({forceAllClose: true})
        }));
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
                this.console = new Console();
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
            setTimeout(function(){ // yuck
                Appc.getInfo(function() {
                    if (platform() === 'darwin') {
                        this.toolbar.populateiOSTargets();
                    } else {
                        this.toolbar.populateAndroidTargets();
                    }
                    // this.toolbar.populateWindowsTargets();

                    this.toolbar.update({disableUI:false});
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
                    atom.notifications.addError('iOS code signing required', {detail: 'Please select a certificate and provisioning profile.'});
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
                atom.notifications.addError('iOS code signing required', {detail: 'Please select a certificate and provisioning profile.'});
                this.toolbar.expand();
                return;
            }

            args = [
                '--platform', platform,
                '--project-dir', atom.project.getPaths()[0],
                '--target', buildCommand,
                '--distribution-name', iOSCodeSigning.certificate,
                '--pp-uuid', iOSCodeSigning.provisioningProfile,
                '--output-dir', atom.config.get('appc.distributionOutputDirectory'),
                '--log-level', logLevel
            ];

            message = (buildCommand === 'dist-adhoc') ? 'iOS ad-hoc' : 'iOS distribution';

        } else if (buildCommand === 'dist-appstore' && platform === 'android') {

            if (!androidKeystore.path || !androidKeystore.alias || !androidKeystore.password) {
                atom.notifications.addError('Android keystore information required', {detail: 'Please provide keystore path, alias and password.'});
                return;
            }

            args = [
                '--platform', platform.value,
                '--project-dir', atom.project.getPaths()[0],
                '--target', 'dist-playstore',
                '--output-dir', atom.config.get('appc.distributionOutputDirectory'),
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
                this.toolbar.update({buildInProgress:false});
            }

        };

        this.toolbar.hud.display({
            text: `Building for ${message}`,
            spinner: true
        });
        if (atom.config.get('appc.displayBuildCommandInConsole')) {
            this.console.write('Executing command:\nappc run ' + options.args.join(' '));
        }
        this.runProc = Appc.run(options);
        this.toolbar.update({buildInProgress:true});
    },

    createController() {
        const miniEditor = document.createElement('atom-text-editor');
        miniEditor.setAttribute('placeholder-text', 'Controller name');
        miniEditor.setAttribute('mini', true);

        const inputPanel = atom.workspace.addModalPanel({
            item: miniEditor
        });
        miniEditor.focus();

        miniEditor.onkeyup = function(e) {
            const str = miniEditor.getModel().getText();
            if (e.keyCode === 27) { // Esc
                miniEditor.remove();
                inputPanel.destroy();
            } else if (str.length > 0 && e.keyCode === 13) {
                if (str !== "") {
                    Appc.generate({
                        type: 'controller',
                        name: str,
                        error: (err) => { atom.notifications.addError(err.message, err) }
                    });
                }
                miniEditor.remove();
                inputPanel.destroy();
            }

        };
    }
}
