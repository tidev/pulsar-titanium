'use babel';

import Button from './button';
import Hud from './hud';
import Select from './select';
import Ti from '../ti';
import {platform} from 'os';

let _showingCodeSigning;

export default class ToolBar {

    constructor () {
        this.element = document.createElement('div');
        this.element.classList.add('toolbar-container');
        atom.workspace.addHeaderPanel({item: this.element});

        this.toolbar = document.createElement('div');
        this.toolbar.classList.add('toolbar');
        this.element.appendChild(this.toolbar);

        this.leftBar = document.createElement('div');
        this.leftBar.classList.add('left-bar');
        this.toolbar.appendChild(this.leftBar);

        this.hud = new Hud();
        this.toolbar.appendChild(this.hud.element);

        this.rightBar = document.createElement('div');
        this.rightBar.classList.add('right-bar');
        this.toolbar.appendChild(this.rightBar);

        this.icon = document.createElement('img');
        this.icon.classList.add('logo');
        this.icon.src = __dirname + '/../../images/appc.png';
        this.leftBar.appendChild(this.icon);

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
            let icon;
            if (e.value === 'run') {
                icon = 'play';
                this.platformSelect.setEnabled(true);
                this.targetSelect.setEnabled(true);
                if (this.selectedTarget().type == 'device') {
                    this.toggleCodeSigningButton.setEnabled(true);
                }
            } else if (e.value === 'distribute') {
                icon = 'paper-plane';
                this.platformSelect.setEnabled(true);
                this.targetSelect.setEnabled(true);
                if (this.selectedTarget().type == 'device') {
                    this.toggleCodeSigningButton.setEnabled(true);
                }
            } else if (e.value === 'custom') {
                icon = 'terminal';
                this.platformSelect.setEnabled(false);
                this.targetSelect.setEnabled(false);
                this.toggleCodeSigningButton.setEnabled(false);
                this.hideCodeSigning();

                const miniEditor = document.createElement('atom-text-editor');
                miniEditor.setAttribute('placeholder-text', 'Options to pass to \'appc ti build\' command');
                if (this.customBuildOptions) {
                    miniEditor.getModel().setText(this.customBuildOptions.join(' '));
                }
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
                            this.customBuildOptions = str.split(' ');
                        }
                        miniEditor.remove();
                        inputPanel.destroy();
                    }

                }.bind(this);
            }
            this.buildButton.setIcon(icon);
        }.bind(this));

        

        this.addButton(this.rightBar, {
            icon: 'plus',
            callback: 'appc:generate',
            tooltip: 'Generate',
            class: 'button-right',
            flat: true
        });

        this.addButton(this.rightBar, {
            icon: 'list-alt',
            callback: 'appc:console',
            tooltip: 'Console',
            class: 'button-right',
            flat: true
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
                this.populateWindowsTargets();
            }
        }.bind(this));

        this.targetSelect = this.addSelect(this.leftBar, {width: '150px'});
        this.targetSelect.onChange(function(e){
            if (this.selectedTarget().type == 'device') {
                this.toggleCodeSigningButton.setEnabled(true);

            } else {
                this.toggleCodeSigningButton.setEnabled(false);
                this.hideCodeSigning();
            }

            if (e.value == 'refresh') {
                this.targetSelect.removeOptions();
                Ti.getInfo(function() {
                    const platform = this.platformSelect.selectedOption().value;
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

        this.toggleCodeSigningButton = this.addButton(this.leftBar, {
            icon: 'cog',
            tooltip: 'Code signing',
            flat: true,
            class: 'button-left',
            callback: function(e){
                if (!_showingCodeSigning) {
                    this.showCodeSigning();
                } else {
                    this.hideCodeSigning();
                }
            }.bind(this),
        });

        this.codeSigning = document.createElement('div');
        this.codeSigning.classList.add('code-signing');

        const certificateTitle = document.createElement('div');
        certificateTitle.classList.add('toolbar-title', 'fa', 'fa-lg', 'fa-id-card');
        this.codeSigning.appendChild(certificateTitle);

        this.certificateSelect = new Select({width: '200px'});
        this.codeSigning.appendChild(this.certificateSelect.element);
        this.certificateSelect.onChange(function(e){
            this.populateiOSDevelopmentProvisioningProfiles();
        }.bind(this));

        const provisioningProfileTitle = document.createElement('div');
        provisioningProfileTitle.classList.add('toolbar-title', 'fa', 'fa-lg', 'fa-file-text');
        this.codeSigning.appendChild(provisioningProfileTitle);

        this.provisioningProfileSelect = new Select({width: '200px'});
        this.codeSigning.appendChild(this.provisioningProfileSelect.element);
    }

    showCodeSigning() {
        this.element.classList.add('toolbar-expanded');
        this.element.appendChild(this.codeSigning);
        _showingCodeSigning = true;
    }

    hideCodeSigning() {
        if (_showingCodeSigning) {
            this.element.classList.remove('toolbar-expanded');
            this.element.removeChild(this.codeSigning);
            _showingCodeSigning = false;
        }
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
        for (const sdkVersion in this.targets.simulators) {
            this.targetSelect.addOption({text: ' ', value: '', disabled: true});
            this.targetSelect.addOption({text: 'iOS ' + sdkVersion + ' Simulators', value: '', disabled: true});
            this.targets.simulators[sdkVersion].forEach(function(simulator) {
                const name = simulator.name + ' (' + simulator.version + ')';
                this.targetSelect.addOption({text: name, value: simulator.udid});
            }, this);
        };

        this.targetSelect.addOption({text: '', value: '', disabled: true});
        this.targetSelect.addOption({text: '──────────', value: '', disabled: true});
        this.targetSelect.addOption({text: 'Refresh Targets', value: 'refresh'});
    }

    populateAndroidTargets() {
        this.targets = Ti.androidTargets();
        this.targetSelect.addOption({text: 'Devices', value: '', disabled: true});
        if (this.targets.devices.length == 0) {
            this.targetSelect.addOption({text: 'No Connected Devices', value: '', disabled: true});
        } else {
            this.targets.devices.forEach(function(target){
                this.targetSelect.addOption({text: target.name, value: target.id});
            }, this);
        }
        for (const type in this.targets.emulators) {
            this.targetSelect.addOption({text: ' ', value: '', disabled: true});
            this.targetSelect.addOption({text: type, value: '', disabled: true});
            this.targets.emulators[type].forEach(function(emulator) {
                const name = emulator.name + ' (' + emulator['sdk-version'] + ')';
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
        const selectedTargetIndex = this.targetSelect.selectedIndex();
        const selectedTarget = this.targetSelect.selectedOption();
        const platform = this.platformSelect.selectedOption();
        let type = 'emulator';
        if (selectedTargetIndex < this.targets.devices.length + 1) {
            type = 'device';
        } else if (platform.value == 'ios') {
            type = 'simulator';
        }

        const id = selectedTarget.value;
        return {
            platform: {
                name: platform.text,
                value: platform.value
            },
            type,
            id
        };
    }

    populateCodeSigning() {
        this.populateiOSDevelopmentCertificates();
        this.populateiOSDevelopmentProvisioningProfiles();
    }

    populateiOSDevelopmentCertificates() {
        this.certificateSelect.removeOptions();
        this.certificates = Ti.iosDevelopmentCertificates();
        this.certificates.forEach(function(certificate) {
            this.certificateSelect.addOption({text: certificate.name, value: certificate.fullname});
        }, this);
    }

    populateiOSDevelopmentProvisioningProfiles() {
        const certificate = this.certificates[this.certificateSelect.selectedIndex()];
        this.provisioningProfileSelect.removeOptions();
        this.provisioningProfiles = Ti.iosDevelopmentProvisioningProfiles(certificate);
        this.provisioningProfiles.forEach(function(profile) {
            this.provisioningProfileSelect.addOption({text: profile.name, value: profile.uuid, disabled: profile.disabled});
        }, this);
    }

    selectedCertificate() {
        const certificate = this.certificates[this.certificateSelect.selectedIndex()];
        return certificate.name;
    }

    selectedProvisioningProfile() {
        const profile = this.provisioningProfiles[this.provisioningProfileSelect.selectedIndex()];
        return profile.uuid;
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
            const buildOption = this.buildSelect.selectedOption().value;
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
