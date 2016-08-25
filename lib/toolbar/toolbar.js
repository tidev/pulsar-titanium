'use babel';

import Button from './button';
import Hud from './hud';
import Select from './select';
import Ti from '../ti';

export default class ToolBar {

    constructor () {
        this.element = document.createElement('div');
        this.element.classList.add('toolbar');
        atom.workspace.addHeaderPanel({item: this.element});

        this.icon = document.createElement('img');
        this.icon.classList.add('logo');
        this.icon.src = __dirname + '/../../images/appc.png';
        this.element.appendChild(this.icon);

        this.addButton({
            icon: 'chevron-right',
            callback: 'appc:run',
            tooltip: 'Run'
        });

        this.addButton({
            icon: 'x',
            callback: 'appc:stop',
            tooltip: 'Stop'
        });

        this.platformSelect = this.addSelect({width: '100px'});
        this.platformSelect.addOption({text: 'iOS', value: 'ios'});
        this.platformSelect.addOption({text: 'Android', value: 'android'});
        this.platformSelect.onChange(function(e){
            this.simulatorSelect.removeOptions();
            if (e.value === 'android') {
                this.populateAndroidAvds(Ti.genymotionAvds());
            } else if (e.value === 'ios') {
                this.populateiOSSimulators(Ti.iosSimulators());
            }
        }.bind(this));

        this.simulatorSelect = this.addSelect({width: '200px'});

        this.hud = new Hud();
        this.element.appendChild(this.hud.element);
    }

    setIcon(src) {
        this.icon.src = src;
    }

    addButton (options) {
        const button = new Button(options);
        this.element.appendChild(button.element);
        return button;
    }

    addSelect(options) {
        const view = new Select(options);
        this.element.appendChild(view.element);
        return view;
    }

    populateiOSSimulators(simulators) {
        for (var sdkVersion in simulators) {
            simulators[sdkVersion].forEach(function(simulator){
                // console.log('populateiOSSimulators: ' + JSON.stringify(this));
                var name = simulator.name + ' (' + simulator.version + ')';
                this.simulatorSelect.addOption({text: name, value: simulator.udid});
            }, this);
        };
    }

    populateAndroidAvds(avds) {
        // if (tiInfo.genymotion && avds.length) {
            avds.forEach(function(avd){
                var name = avd.name + ' (' + avd['sdk-version'] + ')';
                this.simulatorSelect.addOption({text: name, value: avd.id});
            }, this);
        // }
    }

}
