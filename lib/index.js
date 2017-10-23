'use babel'

import {BufferedProcess} from 'atom';
import {platform} from 'os';
import Toolbar from './toolbar/toolbar';
import Console from './toolbar/console';
import Appc from './appc';
import Tiapp from './tiapp';

export default {

    config: {
        distributionOutputDirectory: {
            type: 'string',
            default: './dist/',
            title: 'Distribution build output directory',
            description: 'For iOS ad-hoc and App Store and Google Play builds. Ensure this location has write permission.'
        },
        displayBuildCommandInConsole: {
            type: 'boolean',
            default: true,
            title: 'Display build command in console',
            description: 'The executed build command is written to the console to aid debugging. This will include password arguments.'
        }
    },

    activate() {

        this.loadProject();

        Tiapp.onModified(() => {
            this.toolbar.hud.displayMessage({
                icon: Tiapp.appIcon(),
                text: Tiapp.appName() + ' | ' + Tiapp.sdk(),
                default: true
            });
            this.toolbar.populateCodeSigning();
        });

        // add command hook for running
        atom.commands.add('atom-workspace', 'appc:run', () => {
            if (Tiapp.isTitaniumProject) {
                this.console.clear();
                this.console.show();
                this.runTi();
            }
        });

        atom.commands.add('atom-workspace', 'appc:stop', () => {
            this.runProc.kill();
            this.toolbar.hud.displayDefault();
            this.toolbar.setRunState(false);
        });

        atom.commands.add('atom-workspace', 'appc:generate', () => { this.createController(); });

        atom.commands.add('atom-workspace', 'appc:console', () => {
            if (this.console.isShowing) {
                this.console.hide();
            } else {
                this.console.show();
            }
        });

        atom.project.onDidChangePaths(() => { this.loadProject(); });

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

            this.toolbar.hud.displayMessage({
                icon: Tiapp.appIcon(),
                text: Tiapp.appName() + ' | ' + Tiapp.sdk(),
                default: true
            });
            this.toolbar.setIcon(__dirname + '/../images/ti.png');

            this.toolbar.hud.displayMessage({
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

                    this.toolbar.setRunState(false);
                    this.toolbar.populateCodeSigning();
                    this.toolbar.enableCodeSigning();

                    this.toolbar.hud.displayDefault();
                }.bind(this));
            }.bind(this), 1000);

            return;
        }
    },

    runTi() {
        const target = this.toolbar.selectedTarget();
        const logLevel = this.console.logLevelSelect.selectedOption().value;
        let message;

        let args = {};
        const runOption = this.toolbar.runSelect.selectedOption().value;
        if (runOption == 'run') {
            args = [
                '--platform', target.platform.value,
                '--project-dir', atom.project.getPaths()[0],
                '--target', target.type,
                '--device-id', target.id,
                '--log-level', logLevel
            ];

            if (target.type === 'device' && target.platform.value === 'ios') {
                args = args.concat([
                    '--developer-name', this.toolbar.selectedCertificate(),
                    '--pp-uuid', this.toolbar.selectedProvisioningProfile()
                ]);
            }

            message = `${target.platform.name} ${target.type} ${target.name}`;

        } else if (runOption == 'dist-adhoc' || runOption == 'dist-appstore' && target.platform.value === 'ios') {
            args = [
                '--platform', target.platform.value,
                '--project-dir', atom.project.getPaths()[0],
                '--target', runOption,
                '--distribution-name', this.toolbar.selectedCertificate(),
                '--pp-uuid', this.toolbar.selectedProvisioningProfile(),
                '--output-dir', atom.config.get('appc.distributionOutputDirectory'),
                '--log-level', logLevel
            ];

            message = (runOption == 'dist-adhoc') ? 'iOS ad-hoc' : 'iOS distribution';

        } else if (runOption == 'dist-appstore' && target.platform.value === 'android') {

            const keystore = this.toolbar.keystore();
            if (!keystore.path || !keystore.alias || !keystore.password) {
                atom.notifications.addError('Android keystore information required', {detail: 'Please provide keystore path, alias and password.'});
                return;
            }

            args = [
                '--platform', target.platform.value,
                '--project-dir', atom.project.getPaths()[0],
                '--target', 'dist-playstore',
                '--output-dir', atom.config.get('appc.distributionOutputDirectory'),
                '--keystore', keystore.path,
                '--store-password', keystore.password,
                '--alias', keystore.alias,
                '--log-level', logLevel
            ];

            if (keystore.privateKeyPassword) {
                args.push('--key-password', keystore.privateKeyPassword);
            }

            message = 'Android distribution';

        } else if (runOption == 'custom') {
            args = this.toolbar.customrunOptions.concat(['--project-dir', atom.project.getPaths()[0]]);
        }

        const options = {
            args: args,
            log: (text) => {
                this.console.write(text);
                if (text.indexOf('Start simulator log') != -1 || text.indexOf('Start application log') != -1) {
                    this.toolbar.hud.displayMessage({
                        text: `Running on ${message}`
                    });
                }
            },
            error: (text) => {
                this.console.write(text);
                // this.toolbar.setRunState(false);
            },
            exit: (code) => {
                this.toolbar.hud.displayDefault();
                this.toolbar.setRunState(false);
            }

        };

        this.toolbar.hud.displayMessage({
            text: `Building for ${message}`,
            spinner: true
        });
        if (atom.config.get('appc.displayBuildCommandInConsole')) {
            this.console.write('Executing command:\nappc run ' + options.args.join(' '));
        }
        this.runProc = Appc.run(options);
        this.toolbar.setRunState(true);
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
            if (e.keyCode == 27) { // Esc
                miniEditor.remove();
                inputPanel.destroy();
            } else if (str.length > 0 && e.keyCode == 13) {
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
