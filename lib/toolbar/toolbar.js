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
                this.populateAndroidAvds(Ti.androidAvds());
            } else if (e.value === 'ios') {
                this.populateiOSSimulators(Ti.iosSimulators());
            } else if (e.value === 'windows') {
                this.populateWindowsEmulators(Ti.windowsEmulators());
            }
        }.bind(this));

        this.simulatorSelect = this.addSelect({width: '150px'});

        
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

    populateiOSSimulators(simulators) {
        for (var sdkVersion in simulators) {
            simulators[sdkVersion].forEach(function(simulator) {
                // console.log('populateiOSSimulators: ' + JSON.stringify(this));
                var name = simulator.name + ' (' + simulator.version + ')';
                this.simulatorSelect.addOption({text: name, value: simulator.udid});
            }, this);
        };
    }

    populateAndroidAvds(avds) {
        avds.forEach(function(avd) {
            this.simulatorSelect.addOption({text: avd.name, value: avd.id});
        }, this);
        this.simulatorSelect.selectLast();
    }

    populateWindowsEmulators(emulators) {
        emulators.forEach(function(emulator) {
            this.simulatorSelect.addOption({text: emulator.name, value: emulator.udid});
        }, this);
    }
}
