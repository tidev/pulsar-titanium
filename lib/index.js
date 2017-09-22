'use babel'

import {BufferedProcess} from 'atom';
import {platform} from 'os';
import Toolbar from './toolbar/toolbar';
import Console from './toolbar/console';
import Appc from './appc';
import Tiapp from './tiapp';
import Arrow from './arrow';

export default {

    activate() {

        this.loadProject();

        // add command hook for running
        atom.commands.add('atom-workspace', 'appc:run', () => {
            this.console.clear();
            this.console.show();
            if (Tiapp.isTitaniumProject) {
                this.runTi();
            } else if (Arrow.isArrowProject) {
                this.runArrow();
            } else {

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

        // attempt Arrow Builder project
        Arrow.load();
        if (Arrow.isArrowProject) {
            this.toolbar.hud.displayMessage({
                // icon: Tiapp.appIcon(),
                text: Arrow.appName(),
                default: true
            });
            this.toolbar.setIcon(__dirname + '/../images/arrow.png');
            return;
        }

    },

    runTi() {
        const target = this.toolbar.selectedTarget();
        const logLevel = this.console.logLevelSelect.selectedOption().value;

        this.toolbar.hud.displayMessage({
            text: 'Building for ' + target.platform.name + '...',
            spinner: true
        });

        let args = {};
        const runOption = this.toolbar.runSelect.selectedOption().value;
        if (runOption == 'run') {
            args = [
                '-p', target.platform.value,
                '-d', atom.project.getPaths()[0],
                '-T', target.type,
                '-C', target.id,
                '-l', logLevel
            ];

            if (target.type === 'device' && target.platform.value === 'ios') {
                args = args.concat(['-V', this.toolbar.selectedCertificate(),
                            '-P', this.toolbar.selectedProvisioningProfile()]);
            }

        } else if (runOption == 'dist-adhoc') {
            args = [
                '-p', target.platform.value,
                '-d', atom.project.getPaths()[0],
                '-T', 'dist-adhoc',
                '-R', this.toolbar.selectedCertificate(),
                '-P', this.toolbar.selectedProvisioningProfile(),
                '-O', atom.project.getPaths()[0] + '/dist',
                '-l', logLevel
            ];

        } else if (runOption == 'custom') {
            args = this.toolbar.customrunOptions.concat(['-d', atom.project.getPaths()[0]]);
        }

        const options = {
            args: args,
            log: (text) => {
                this.console.write(text);
                if (text.indexOf('built successfully') != -1) {
                    this.toolbar.hud.displayMessage({
                        text: 'Built | Running on ' + 'TBC',
                        flash: true
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
        this.console.write('Executing command:\n\nappc run ' + options.args.join(' ') + '\n\n\n');
        this.runProc = Appc.run(options);
        this.toolbar.setRunState(true);
    },

    runArrow() {
        this.toolbar.hud.displayMessage({
            text: 'Running local Arrow server...',
            spinner: true
        });

        const command = 'appc';
        const args = ['run', '-d', atom.project.getPaths()[0]];
        const stdout = function(output) {
            console.log(output)
            this.console.write(output);
        }.bind(this);
        const stderr = function(output) {
            console.error(output);
            this.console.write(output);
        }.bind(this);
        const exit = function(code) { console.log(`'appc run' exited with #{code}"`) };
        this.runProc = new BufferedProcess({command, args, stdout, stderr, exit});
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
