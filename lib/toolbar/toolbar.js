'use babel';

import Button from './button';
import Hud from './hud';
import Select from './select';
import Ti from '../ti';
import {platform} from 'os';

export default class ToolBar {

    constructor () {
        this.element = document.createElement('div');
        this.element.classList.add('toolbar');
        atom.workspace.addHeaderPanel({item: this.element});

        this.leftBar = document.createElement('div');
        this.leftBar.classList.add('left-bar');
        this.element.appendChild(this.leftBar);

        this.hud = new Hud();
        this.element.appendChild(this.hud.element);

        this.rightBar = document.createElement('div');
        this.rightBar.classList.add('right-bar');
        this.element.appendChild(this.rightBar);

        this.icon = document.createElement('img');
        this.icon.classList.add('logo');
        this.icon.src = __dirname + '/../../images/appc.png';
        this.leftBar.appendChild(this.icon);

        this.addButton(this.rightBar, {
            icon: 'plus',
            callback: 'appc:generate',
            tooltip: 'Generate',
            class: 'button-right'
        });
        
        this.buildButtonContainer = document.createElement('div');
        this.buildButtonContainer.classList.add('element', 'button-left', 'build-button-container');
        this.leftBar.appendChild(this.buildButtonContainer);

        this.buildButton = this.addButton(this.buildButtonContainer, {
            icon: 'play',
            callback: 'appc:run',
            tooltip: 'Build / Stop',
            class: 'button-left'
        });
        this.buildButton.element.classList.remove('element');
        this.buildButton.element.classList.add('build-button');

        this.buildSelect = this.addSelect(this.buildButtonContainer, {width: '20px'});
        this.buildSelect.element.classList.remove('element');
        this.buildSelect.element.classList.add('build-select');
        this.buildSelect.addOptions([{text: 'Run', value: 'run'},
                                    //  {text: 'Distribute', value: 'distribute'},
                                     {text: 'Custom', value: 'custom'}]);
        this.buildSelect.onChange(function(e){
            var icon;
            if (e.value === 'run') {
                icon = 'play';
                this.platformSelect.setEnabled(true);
                this.targetSelect.setEnabled(true);
            } else if (e.value === 'distribute') {
                icon = 'paper-plane';
                this.platformSelect.setEnabled(true);
                this.targetSelect.setEnabled(true);
            } else if (e.value === 'custom') {
                icon = 'terminal';
                this.platformSelect.setEnabled(false);
                this.targetSelect.setEnabled(false);

                var miniEditor = document.createElement('atom-text-editor');
                miniEditor.setAttribute('placeholder-text', 'Options to pass to \'appc ti build\' command');
                if (this.customBuildOptions) {
                    miniEditor.getModel().setText(this.customBuildOptions.join(' '));
                }
                miniEditor.setAttribute('mini', true);

                var inputPanel = atom.workspace.addModalPanel({
                    item: miniEditor
                });
                miniEditor.focus();

                miniEditor.onkeyup = function(e) {
                    var str = miniEditor.getModel().getText();
                    if (e.keyCode == 27) { // Esc
                        miniEditor.remove();
                        inputPanel.destroy();
                    } else if (str.length > 0 && e.keyCode == 13) {
                        if (str !== "") {
                            this.customBuildOptions = str.split(' ');
                        }
                        miniEditor.remove();
                        inputPanel.destroy();
                    }

                }.bind(this);
            }
            this.buildButton.setIcon(icon);
        }.bind(this));

        // this.addButton(this.leftBar, {
        //     icon: 'stop',
        //     callback: 'appc:stop',
        //     tooltip: 'Stop'
        // });

        this.addButton(this.rightBar, {
            icon: 'sticky-note',
            callback: 'appc:console',
            tooltip: 'Console',
            class: 'button-right'
        });

        // add platform selector
        this.platformSelect = this.addSelect(this.leftBar, {width: '90px'});
        if (platform() === 'darwin') {
            this.platformSelect.addOption({text: 'iOS', value: 'ios'});
        }
        this.platformSelect.addOption({text: 'Android', value: 'android'});
        if (platform() === 'win32') {
            this.platformSelect.addOption({text: 'Windows', value: 'windows'});
        }
        this.platformSelect.onChange(function(e){
            this.targetSelect.removeOptions();
            if (e.value === 'android') {
                this.populateAndroidTargets();
            } else if (e.value === 'ios') {
                this.populateiOSTargets();
            } else if (e.value === 'windows') {
                this.populateWindowsEmulators();
            }
        }.bind(this));

        this.targetSelect = this.addSelect(this.leftBar, {width: '150px'});
        this.targetSelect.onChange(function(e){
            if (e.value == 'refresh') {
                this.targetSelect.removeOptions();
                Ti.getInfo(function() {
                    console.log(this);
                    var platform = this.platformSelect.selectedOption().value;
                    if (platform == 'ios') {
                        this.populateiOSTargets();
                    } else if (platform == 'android') {
                        this.populateAndroidTargets();
                    } else if (platform == 'windows') {
                        this.populateWindowsTargets();
                    }
                }.bind(this));
            }
        }.bind(this));

        this.targets = {};
    }



    setIcon(src) {
        this.icon.src = src;
    }

    addButton(parent, options) {
        const button = new Button(options);
        parent.appendChild(button.element);
        return button;
    }

    addSelect(parent, options) {
        const view = new Select(options);
        parent.appendChild(view.element);
        return view;
    }

    populateiOSTargets() {
        this.targets = Ti.iOSTargets();
        this.targetSelect.addOption({text: 'Devices', value: '', disabled: true});
        if (this.targets.devices.length == 0) {
            this.targetSelect.addOption({text: 'No Device Targets', value: '', disabled: true});
        } else {
            this.targets.devices.forEach(function(target){
                this.targetSelect.addOption({text: target.name, value: target.udid});
            }, this);
            if (this.targets.devices.length == 1 && this.targets.devices[0].udid == 'itunes') {
                this.targetSelect.addOption({text: 'No Connected Devices', value: '', disabled: true});
            }
        }
        for (var sdkVersion in this.targets.simulators) {
            this.targetSelect.addOption({text: ' ', value: '', disabled: true});
            this.targetSelect.addOption({text: 'iOS ' + sdkVersion + ' Simulators', value: '', disabled: true});
            this.targets.simulators[sdkVersion].forEach(function(simulator) {
                var name = simulator.name + ' (' + simulator.version + ')';
                this.targetSelect.addOption({text: name, value: simulator.udid});
            }, this);
        };

        this.targetSelect.addOption({text: '', value: '', disabled: true});
        this.targetSelect.addOption({text: '──────────', value: '', disabled: true});
        this.targetSelect.addOption({text: 'Refresh Targets', value: 'refresh'});
    }

    populateAndroidTargets() {
        var selected = false;
        this.targets = Ti.androidTargets();
        this.targetSelect.addOption({text: 'Devices', value: '', disabled: true});
        if (this.targets.devices.length == 0) {
            this.targetSelect.addOption({text: 'No Connected Devices', value: '', disabled: true});
        } else {
            this.targets.devices.forEach(function(target){
                this.targetSelect.addOption({text: target.name, value: target.id});
            }, this);
        }
        for (var type in this.targets.emulators) {
            this.targetSelect.addOption({text: ' ', value: '', disabled: true});
            this.targetSelect.addOption({text: type, value: '', disabled: true});
            this.targets.emulators[type].forEach(function(emulator) {
                var name = emulator.name + ' (' + emulator['sdk-version'] + ')';
                this.targetSelect.addOption({text: name, value: emulator.id});
            }, this);
        }
        
        this.targetSelect.addOption({text: '', value: '', disabled: true});
        this.targetSelect.addOption({text: '──────────', value: '', disabled: true});
        this.targetSelect.addOption({text: 'Refresh Targets', value: 'refresh'});
    }

    populateWindowsTargets() {
        this.targets = Ti.windowsTargets();
        this.targets.emulators.forEach(function(emulator) {
            this.targetSelect.addOption({text: emulator.name, value: emulator.udid});
        }, this);
    }

    selectedTarget() {
        var selectedTargetIndex = this.targetSelect.selectedIndex();
        var selectedTarget = this.targetSelect.selectedOption();
        var platform = this.platformSelect.selectedOption();
        var type = 'emulator';
        if (selectedTargetIndex < this.targets.devices.length + 1) {
            type = 'device';
        } else if (platform.value == 'ios') {
            type = 'simulator';
        }
        
        var id = selectedTarget.value;
        return { 
            platform: {
                name: platform.text,
                value: platform.value
            }, 
            type, 
            id 
        };
    }

    setRunState(inProgress) {
        if (inProgress) {
            this.buildButton.setIcon('stop');
            this.buildButton.setCallback('appc:stop');
            this.buildSelect.setEnabled(false);
            this.platformSelect.setEnabled(false);
            this.targetSelect.setEnabled(false);
        } else {
            this.buildButton.setCallback('appc:run');
            this.buildSelect.setEnabled(true);
            var buildOption = this.buildSelect.selectedOption().value;
            if (buildOption == 'run') {
                this.buildButton.setIcon('play');
                this.platformSelect.setEnabled(true);
                this.targetSelect.setEnabled(true);
            } else if (buildOption == 'distribute') {
                this.buildButton.setIcon('paper-plane');
                this.platformSelect.setEnabled(true);
                this.targetSelect.setEnabled(true);
            } else if (buildOption == 'custom') {
                this.buildButton.setIcon('terminal');
            }
        }
    }

    
}
