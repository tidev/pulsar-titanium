/** @babel */
/** @jsx etch.dom */

import {platform} from 'os';
import etch from 'etch';
import Appc from '../appc';
import Tiapp from '../tiapp';
import Button from './button';
import Select from './select';
import Hud from './hud';

etch.setScheduler(atom.views);

/**
 * Toolbar
 */
export default class Toolbar {

    constructor() {
        this.targetOptions = [{value:'', text:'', disabled:true}];

        this.state = {
            buildCommand: 'run',
            buildCommandName: 'Run',
            platform: (platform() === 'darwin') ? 'ios' : 'android',
            platformName: (platform() === 'darwin') ? 'iOS' : 'Android',
            target: null,
            targetName: null,
            disableUI: true,
            buildInProgress: false,
            codeSigningAvailable: true,
            showingCodeSigning: false,
            showingCustom: false,
            customArgs: '',
            iOSCodeSigning: {
                certificate: null,
                provisioningProfile: null
            },
            androidKeystore: {
                path: '',
                alias: '',
                password: '',
                privateKeyPassword: ''
            }
        };

        etch.initialize(this);

        atom.workspace.addHeaderPanel({item: this.element});
    }

    render() {
        let buildButtonIcon = 'playback-play';
        if (this.state.buildInProgress) {
            buildButtonIcon = 'primitive-square';
        } else {
            switch (this.state.buildCommand) {
                case 'run':
                    buildButtonIcon = 'playback-play';
                    break;
                case 'dist-adhoc':
                    buildButtonIcon = 'rocket';
                    break;
                case 'dist-appstore':
                    buildButtonIcon = 'package';
                    break;
                case 'custom':
                    buildButtonIcon = 'code';
                    break;
                default:
                    break;
            }
        }

        let buildOptions;
        if (this.state.platform === 'ios') {
            buildOptions = [
                <option value='run'>Run</option>,
                <option value='dist-adhoc'>Ad-hoc</option>,
                <option value='dist-appstore'>Publish</option>,
                <option value='custom'>Custom</option>
            ];
        } else if (this.state.platform === 'android') {
            buildOptions = [
                <option value='run'>Run</option>,
                <option value='dist-appstore'>Publish</option>,
                <option value='custom'>Custom</option>
            ];
        }

        let platformOptions = [];
        if (platform() === 'darwin') {
            platformOptions = [
                <option value='ios'>iOS</option>, 
                <option value='android'>Android</option>
            ];
        } else if (platform() === 'win32') {
            platformOptions = [
                <option value='android'>Android</option>, 
                <option value='windows'>Windows</option>
            ];
        }

        let expandedToolbarRow = '';
        if (this.state.showingCodeSigning) {
            if (this.state.platform === 'ios') {

                expandedToolbarRow = (
                    <div className='toolbar-row'>
                        {/* <div className='toolbar-left'>
                            <div className='toolbar-item-title'>iOS Code Signing</div>
                        </div> */}
                        <div className='toolbar-center'>
                            <div className='toolbar-item-title icon icon-organization' />
                            <Select ref='iOSCertificateSelect' attributes={{style:'width:200px;'}} change={this.iOSCertificateSelectValueDidChange.bind(this)}>
                                {this.iOSCertificates.map(certificate => 
                                    <option value={certificate.fullname}>{certificate.name}</option>
                                )} 
                            </Select>
                            <div className='toolbar-item-title icon icon-file' />
                            <Select ref='iOSProvisioningProfileSelect' attributes={{style:'width:200px;'}} change={this.iOSProvisioningProfileSelectValueDidChange.bind(this)}>
                                {this.iOSProvisioningProfiles.map(profile => 
                                    <option value={profile.uuid} disabled={profile.disabled}>{profile.name}</option>
                                )} 
                            </Select>
                        </div>
                        <div className='toolbar-right'>
                            <Button flat='true' icon='x' click={this.codeSigningButtonClick.bind(this)} />
                        </div>
                    </div>
                )

            } else if (this.state.platform === 'android') {

                expandedToolbarRow = (
                    <div className='toolbar-row'>
                        {/* <div className='toolbar-left'>
                            <div className='toolbar-item-title'>Android Keystore</div>
                        </div> */}
                        <div className='toolbar-center'>
                            <div className='toolbar-item-title'>Path:</div>
                            <input className='input-text native-key-bindings input keystore-path-input' ref='androidKeystorePath' value={this.state.androidKeystore.path} on={{change:this.androidKeystoreDidChange}} />
                            <Button flat='true' icon='file-directory' click={this.androidKeystoreButtonClick.bind(this)} />
                            <div className='toolbar-item-title'>Alias:</div>
                            <input className='input-text native-key-bindings input' ref='androidKeystoreAlias' value={this.state.androidKeystore.alias} on={{change:this.androidKeystoreDidChange}} />
                            <div className='toolbar-item-title'>Password:</div>
                            <input type='password' className='input-text native-key-bindings input' ref='androidKeystorePassword' value={this.state.androidKeystore.password} on={{change:this.androidKeystoreDidChange}} />
                            <div className='toolbar-item-title'>Private key password:</div>
                            <input type='password' className='input-text native-key-bindings input' ref='androidKeystorePrivateKeyPassword' value={this.state.androidKeystore.privateKeyPassword} on={{change:this.androidKeystoreDidChange}} />
                        </div>
                        <div className='toolbar-right'>
                            <Button flat='true' icon='x' click={this.codeSigningButtonClick.bind(this)} />
                        </div>
                    </div>
                )

            }
        } else if (this.state.buildCommand === 'custom') {
            
            expandedToolbarRow = (
                <div className='toolbar-row'>
                    <div className='toolbar-center'>
                        <div className='toolbar-item-title'>Custom args:</div>
                        <input className='input-text native-key-bindings input keystore-path-input' ref='customArgs' value={this.state.customArgs} attributes={{'placeholder':'args passed to appc run command...'}} on={{change:this.customArgsDidChange}} />
                        </div>
                    <div className='toolbar-right'>
                        <Button flat='true' icon='x' click={this.codeSigningButtonClick.bind(this)} />
                    </div>
                </div>
            )
        }

        

		return (
            <div className={this.state.showingCodeSigning || this.state.buildCommand === 'custom' ? 'appc-toolbar toolbar-expanded' : 'appc-toolbar'}>

                <div className='toolbar-row'>

                    <div className='toolbar-left main-toolbar-group'>

                        <img className='logo' src={`${__dirname}/../../images/ti_28.png`} attributes={{'srcset':`${__dirname}/../../images/ti_28.png 1x, ${__dirname}/../../images/ti_56.png 2x`}} />
        
                        <div className='toolbar-item button build-button-container'>
                            <Button ref='buildButton' className='build-button' custom='true' icon={buildButtonIcon} disabled={this.state.disableUI} click={this.buildButtonClick.bind(this)} />
                            <Select ref='buildSelect' className='build-select' custom='true' value={this.state.buildCommand} attributes={{style:'width:20px;'}} disabled={this.state.disableUI} change={this.buildSelectValueDidChange.bind(this)}>
                                {buildOptions}
                            </Select>
                        </div>
                        
                        <Select ref='platformSelect' attributes={{style:'width:90px;'}} disabled={this.state.disableUI || this.state.buildCommand === 'custom'} change={this.platformSelectValueDidChange.bind(this)}>
                            {platformOptions}
                        </Select>
        
                        <Select ref='targetSelect' attributes={{style:'width:150px;'}} disabled={this.state.disableUI || this.state.buildCommand != 'run'} change={this.targetSelectValueDidChange.bind(this)}>
                            {this.targetOptions.map(target => 
                                <option value={target.value} disabled={target.disabled}>{target.text}</option>
                            )} 
                        </Select>
        
                        <Button icon='gear' flat='true' disabled={this.state.disableUI || !this.state.codeSigningAvailable} click={this.codeSigningButtonClick.bind(this)} />
                    </div>

                    <Hud ref='hud' />
                    
                    <div className='toolbar-right main-toolbar-group'>
                        <Button icon='plus' className='button-right' flat='true' disabled={this.state.disableUI} click={this.addControllerButtonClick.bind(this)} />
                        <Button icon='three-bars' className='button-right' flat='true' disabled={this.state.disableUI} click={this.toggleConsoleButtonClick.bind(this)} />
                    </div>

                </div>

                {expandedToolbarRow}

            </div>
        )
	}

	update(opts) {
        opts && Object.assign(this.state, opts);
        etch.update(this);
    }
    
    readAfterUpdate() {
        this.getState();
    }

	async destroy() {
		await etch.destroy(this);
    }

    get hud() {
        return this.refs.hud;
    }

    getState() {
        const buildCommand = this.refs.buildSelect.selectedOption;
        const platform = this.refs.platformSelect.selectedOption;
        const target = this.refs.targetSelect.selectedOption;

        let targetType = platform.value === 'ios' ? 'simulator' : 'emulator';
        if (this.targets.devices && target.index < this.targets.devices.length + 1) {
            targetType = 'device';
        } 

        Object.assign(this.state, {
            buildCommand: buildCommand.value,
            buildCommandName: buildCommand.text,
            platform: platform.value,
            platformName: platform.text,
            target: target.value,
            targetName: target.text,
            targetType
        });

        if ((this.state.platform === 'ios' && ((this.state.buildCommand === 'run' && this.state.targetType === 'device') || this.state.buildCommand === 'dist-adhoc' || this.state.buildCommand === 'dist-appstore'))
           || (this.state.platform === 'android' && this.state.buildCommand === 'dist-appstore')) {
            this.state.codeSigningAvailable = true;
        } else {
            this.state.codeSigningAvailable = false;
            this.state.showingCodeSigning = false;
        } 

        if (this.refs.iOSCertificateSelect) {
            this.state.iOSCodeSigning = {
                certificate: this.refs.iOSCertificateSelect.selectedOption.value,
                provisioningProfile: this.refs.iOSProvisioningProfileSelect.selectedOption.value
            }
        }

        if (this.refs.androidKeystorePath) {
            this.state.androidKeystore = {
                path: this.refs.androidKeystorePath.value,
                alias: this.refs.androidKeystoreAlias.value,
                password: this.refs.androidKeystorePassword.value,
                privateKeyPassword: this.refs.androidKeystorePrivateKeyPassword.value
            }
        }
        
        if (this.refs.customArgs) {
            this.state.customArgs = this.refs.customArgs.value;
        }

        return this.state;
    }

    populateiOSTargets(targets) {
        this.targets = Appc.iOSTargets();
        this.targetOptions = [];
        this.targetOptions.push({value:'', text:'Devices', disabled:true});
        if (this.targets.devices.length === 0) {
            this.targetOptions.push({value: '', text: 'No Device Targets', disabled: true});
        } else {
            this.targets.devices.forEach((target) => {
                this.targetOptions.push({value: target.udid, text: target.name});
            });
            if (this.targets.devices.length === 1 && this.targets.devices[0].udid === 'itunes') {
                this.targetOptions.push({value: '', text: 'No Connected Devices', disabled: true});
            }
        }
        for (const sdkVersion in this.targets.simulators) {
            this.targetOptions.push({value: '', text: ' ', disabled: true});
            this.targetOptions.push({value: '', text: 'iOS ' + sdkVersion + ' Simulators', disabled: true});
            this.targets.simulators[sdkVersion].forEach(function(simulator) {
                const name = simulator.name + ' (' + simulator.version + ')';
                this.targetOptions.push({value: simulator.udid, text: name});
            }, this);
        };
        this.targetOptions.push({value: '', text: '', disabled: true});
        this.targetOptions.push({value: '', text: '──────────', disabled: true});
        this.targetOptions.push({value: 'refresh', text: 'Refresh Targets'});

        etch.update(this);
    }

    populateAndroidTargets(targets) {
        this.targets = Appc.androidTargets();
        this.targetOptions = [];
        this.targetOptions.push({value: '', text: 'Devices', disabled: true});
        if (this.targets.devices.length === 0) {
            this.targetOptions.push({value: '', text: 'No Connected Devices', disabled: true});
        } else {
            this.targets.devices.forEach((target) => {
                this.targetOptions.push({value: target.id, text: target.name});
            });
        }
        for (const type in this.targets.emulators) {
            this.targetOptions.push({value: '', text: ' ', disabled: true});
            this.targetOptions.push({value: '', text: type, disabled: true});
            this.targets.emulators[type].forEach((emulator) => {
                const name = emulator.name + ' (' + emulator['sdk-version'] + ')';
                this.targetOptions.push({value: emulator.id, text: name});
            });
        }

        this.targetOptions.push({value: '', text: '', disabled: true});
        this.targetOptions.push({value: '', text: '──────────', disabled: true});
        this.targetOptions.push({value: 'refresh', text: 'Refresh Targets'});

        etch.update(this);
    }

    populateWindowsTargets() {
        this.targets = Appc.windowsTargets();
        this.targets.emulators.forEach((emulator) => {
            this.targetOptions.push({value: emulator.udid, text: emulator.name});
        });

        etch.update(this);
    }

    populateiOSCertificates() {
        this.iOSCertificates = Appc.iosCertificates(this.state.buildCommand === 'run' ? 'developer' : 'distribution');
        this.iOSCertificates.sort(function(a, b){
            return a.name > b.name;
        });
    }

    populateiOSProvisioningProfiles() {
        let certificate = this.iOSCertificates[0];
        if (this.refs.iOSCertificateSelect) {
            certificate = this.iOSCertificates[this.refs.iOSCertificateSelect.selectedOption.index];
        }
        
        let deployment = 'development';
        if (this.state.buildCommand === 'dist-adhoc') {
            deployment = 'distribution';
        } else if (this.state.buildCommand === 'dist-appstore') {
            deployment = 'appstore';
        }
        this.iOSProvisioningProfiles = Appc.iosProvisioningProfiles(deployment, certificate, Tiapp.appId());
        this.iOSProvisioningProfiles.sort(function(a, b){
            return a.name > b.name;
        });
    }





    buildButtonClick(event) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), (this.state.buildInProgress) ? 'appc:stop' : 'appc:build');
    }

    buildSelectValueDidChange(event) {
        this.getState();
        etch.update(this);
    }

    platformSelectValueDidChange(event) {
        this.getState();
        if (this.state.platform === 'ios') {
            this.populateiOSTargets();
        } else if (this.state.platform === 'android') {
            if (this.state.buildCommand === 'dist-adhoc') {
                this.refs.buildSelect.update({value:'dist-appstore'});
                this.getState();
            }
            this.populateAndroidTargets();
        }
        etch.update(this);
    }

    targetSelectValueDidChange(event) {
        if (event.target.value === 'refresh') {
            // this.runButton.setEnabled(false);
            // this.targetSelect.removeOptions();
            this.targets = [];
            this.targetOptions = [{value:'', text:'', disabled:true}];
            this.update({disableUI:true});
            this.hud.display({
                text: 'Refreshing Targets...',
                spinner: true
            });
            Appc.getInfo(() => {
                switch (this.state.platform) {
                    case 'ios':
                        this.populateiOSTargets();
                        break;
                    case 'android':
                        this.populateAndroidTargets();
                        break;
                    case 'windows':
                        this.populateWindowsTargets();
                        break;
                }
                this.hud.displayDefault();
                this.getState();
                this.update({disableUI:false});
            });
        } else {
            this.getState();
            etch.update(this);
        }
    }

    codeSigningButtonClick(event) {
        if (this.state.codeSigningAvailable) {
            this.state.showingCodeSigning = !this.state.showingCodeSigning;
            if (this.state.platform === 'ios') {
                this.populateiOSCertificates();
                this.populateiOSProvisioningProfiles();
            }
        }
        etch.update(this);
    }

    iOSCertificateSelectValueDidChange(event) {
        this.getState();
        this.populateiOSProvisioningProfiles();
        etch.update(this);
    }

    iOSProvisioningProfileSelectValueDidChange(event) {
        this.getState();
    }

    androidKeystoreButtonClick(event) {
        const {dialog} = require('electron').remote;
        const filePaths = dialog.showOpenDialog({properties: ['openFile', 'showHiddenFiles']});
        console.log(JSON.stringify(filePaths));
        if (filePaths && filePaths[0].length > 0) {
            this.state.androidKeystore.path = filePaths[0];
        }
        etch.update(this);
    }

    androidKeystoreDidChange(event) {
        this.getState();
        etch.update(this);
    }

    customArgsDidChange(event) {
        this.getState();
        etch.update(this);
    }

    addControllerButtonClick(event) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'appc:generate');
    }

    toggleConsoleButtonClick(event) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'appc:console:toggle');
    }
}