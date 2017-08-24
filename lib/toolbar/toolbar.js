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
        
        this.addButton(this.leftBar, {
            icon: 'play',
            callback: 'appc:run',
            tooltip: 'Run',
            class: 'button-left'
        });

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
        this.platformSelect = this.addSelect({width: '90px'});
        if (platform() === 'darwin') {
            this.platformSelect.addOption({text: 'iOS', value: 'ios'});
        }
        this.platformSelect.addOption({text: 'Android', value: 'android'});
        if (platform() === 'win32') {
            this.platformSelect.addOption({text: 'Windows', value: 'windows'});
        }
        this.platformSelect.onChange(function(e){
            this.simulatorSelect.removeOptions();
            if (e.value === 'android') {
                this.populateAndroidTargets();
            } else if (e.value === 'ios') {
                this.populateiOSTargets();
            } else if (e.value === 'windows') {
                this.populateWindowsEmulators();
            }
        }.bind(this));

        this.simulatorSelect = this.addSelect({width: '150px'});

        this.targets = {};
    }

    setIcon(src) {
        this.icon.src = src;
    }

    addButton (parent, options) {
        const button = new Button(options);
        parent.appendChild(button.element);
        return button;
    }

    addSelect(options) {
        const view = new Select(options);
        this.leftBar.appendChild(view.element);
        return view;
    }

    populateiOSTargets() {
        this.targets = Ti.iOSTargets();
        this.simulatorSelect.addOption({text: 'Devices', value: '', disabled: true});
        if (this.targets.devices.length == 0) {
            this.simulatorSelect.addOption({text: 'No connected devices', value: '', disabled: true});
        } else {
            this.targets.devices.forEach(function(target){
                this.simulatorSelect.addOption({text: target.name, value: target.udid});
            }, this);
        }
        for (var sdkVersion in this.targets.simulators) {
            this.simulatorSelect.addOption({text: ' ', value: '', disabled: true});
            this.simulatorSelect.addOption({text: 'iOS ' + sdkVersion + ' Simulators', value: '', disabled: true});
            this.targets.simulators[sdkVersion].forEach(function(simulator) {
                var name = simulator.name + ' (' + simulator.version + ')';
                this.simulatorSelect.addOption({text: name, value: simulator.udid});
            }, this);
        };
    }

    populateAndroidTargets() {
        var selected = false;
        this.targets = Ti.androidTargets();
        this.simulatorSelect.addOption({text: 'Devices', value: '', disabled: true});
        if (this.targets.devices.length == 0) {
            this.simulatorSelect.addOption({text: 'No connected devices', value: '', disabled: true});
        } else {
            this.targets.devices.forEach(function(target){
                this.simulatorSelect.addOption({text: target.name, value: target.id});
            }, this);
        }
        for (var type in this.targets.emulators) {
            this.simulatorSelect.addOption({text: ' ', value: '', disabled: true});
            this.simulatorSelect.addOption({text: type, value: '', disabled: true});
            this.targets.emulators[type].forEach(function(emulator) {
                var name = emulator.name + ' (' + emulator['sdk-version'] + ')';
                this.simulatorSelect.addOption({text: name, value: emulator.id});
            }, this);
        }
        // this.simulatorSelect.selectLast();
    }

    populateWindowsTargets() {
        this.targets = Ti.windowsTargets();
        this.targets.emulators.forEach(function(emulator) {
            this.simulatorSelect.addOption({text: emulator.name, value: emulator.udid});
        }, this);
    }

    selectedTarget() {
        var selectedTargetIndex = this.simulatorSelect.selectedIndex();
        var selectedTarget = this.simulatorSelect.selectedOption();
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

    

    
}
