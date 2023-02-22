/** @babel */
/** @jsx etch.dom */

import { CompositeDisposable } from 'atom';
import { platform } from 'os';
import { remote } from 'electron';
import etch from 'etch';
import Appc from '../appc';
import Project from '../project';
import Button from './button.jsx';
import Select from './select.jsx';
import Hud from './hud.jsx';
import Utils from '../utils';
import { Octicon } from './octicon.jsx';

etch.setScheduler(atom.views);

/**
 * Toolbar
 */
export default class Toolbar {

	buildCommand() {
		const buildCommand = Utils.get(`appcelerator-titanium.general.${this.normalizedAppName}.buildCommand`);
		const buildCommandName = Utils.get(`appcelerator-titanium.general.${this.normalizedAppName}.buildCommandName`);

		if (buildCommand !== null && buildCommand !== undefined) {
			return {
				name: buildCommand,
				text: buildCommandName
			};
		} else if (Project.isTitaniumApp) {
			return {
				name: 'run',
				text: 'Run'
			};
		}

		// No Titanium project -> Module
		return {
			name: 'build',
			text: 'Build'
		};
	}

	selectedPlatform() {
		const selectedPlatform = Utils.get(`appcelerator-titanium.general.${this.normalizedAppName}.selectedPlatform`);

		if (selectedPlatform !== null && selectedPlatform !== undefined) {
			return {
				value: selectedPlatform,
				text: Utils.nameForPlatform(selectedPlatform)
			};
		}

		// The defaults per platform
		if (platform() === 'darwin') {
			return {
				value: 'ios',
				text: 'iOS'
			};
		}

		return {
			value: 'android',
			text: 'Android'
		};
	}

	/**
	 * Constructor
	 */
	constructor() {
		this.targets = {};
		this.normalizedAppName = Project.normalizedAppName();
		this.targetOptions = [ { value: '', text: '', disabled: true } ];

		this.state = {
			buildCommand: this.buildCommand().name,
			buildCommandName: this.buildCommand().text,
			platform: this.selectedPlatform().value,
			platformName: this.selectedPlatform().text,
			selectedTarget: {},
			target: null,
			targetName: null,
			disableUI: true,
			enableLiveview: Utils.get('appcelerator-titanium.general.liveviewEnabled'),
			isDebugMode: Utils.get('appcelerator-titanium.general.isDebugMode'),
			buildInProgress: false,
			codeSigningAvailable: true,
			showingCodeSigning: false,
			showingCustom: false,
			customArgs: Utils.get('appcelerator-titanium.general.customArgs') || '',
			iOSCodeSigning: {
				certificate: Utils.get(`appcelerator-titanium.ios.${this.normalizedAppName}.selectedCertificate`),
				provisioningProfile: Utils.get(`appcelerator-titanium.ios.${this.normalizedAppName}.selectedProvisioningProfile`),
				output: Utils.get(`appcelerator-titanium.ios.${this.normalizedAppName}.selectedOutput`),
			},
			androidKeystore: {
				path: Utils.get('appcelerator-titanium.android.keystorePath'),
				alias: Utils.get('appcelerator-titanium.android.keystoreAlias'),
				password: '',
				privateKeyPassword: ''
			}
		};

		this.subscriptions = new CompositeDisposable();
		this.subscriptions.add(
			atom.config.observe('titanium.android.keystorePath', value => {
				this.state.androidKeystore.path = value;
				this.update();
			}),
			atom.config.observe('titanium.android.keystoreAlias', value => {
				this.state.androidKeystore.alias = value;
				this.update();
			})
		);

		etch.initialize(this);

		this.panel = atom.workspace.addHeaderPanel({ item: this.element, visible: Utils.get('appcelerator-titanium.general.showToolbar') });
	}

	/**
	 * Clean up
	 */
	async destroy() {
		this.subscriptions.dispose();
		await etch.destroy(this);
	}

	/**
	 * Current state virtual DOM element
	 *
	 * @returns {Object}
	 */
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
				case 'build':
					buildButtonIcon = 'package';
					break;
				case 'custom':
					buildButtonIcon = 'code';
					break;
				default:
					break;
			}
		}
		let buildOptions = [];
		if (Project.isTitaniumApp) {
			switch (this.state.platform) {
				case 'ios':
					buildOptions = [
						<option value="run">Run</option>,
						<option value="dist-adhoc">Ad-Hoc</option>,
						<option value="dist-appstore">App Store</option>,
						<option value="custom">Custom</option>
					];
					break;
				case 'android':
					buildOptions = [
						<option value="run">Run</option>,
						<option value="dist-appstore">Play Store</option>,
						<option value="custom">Custom</option>
					];
					break;
			}
		} else if (Project.isTitaniumModule) {
			buildOptions = [
				<option value="build">Build</option>
			];
		}

		let platformOptions = [];
		let platforms = Utils.platforms();

		if (Project.isTitaniumModule) {
			platforms = platforms.filter(platform => Project.platforms().includes(platform));
		}
		for (let i = 0, numPlatforms = platforms.length; i < numPlatforms; i++) {
			platformOptions.push(<option value={platforms[i]}>{Utils.nameForPlatform(platforms[i])}</option>);
		}

		let expandedToolbarRow = '';
		if (this.state.showingCodeSigning) {
			if (this.state.platform === 'ios') {
				this.populateiOSCertificates();
				this.populateiOSProvisioningProfiles();
				expandedToolbarRow = (
					<div className="toolbar-row">
						<div className="toolbar-center">
							<div className="toolbar-item-title icon icon-organization" />
							<Select ref="iOSCertificateSelect" attributes={{ style: 'width:200px;' }} title={this.state.iOSCodeSigning.certificate} change={this.iOSCertificateSelectValueDidChange.bind(this)}>
								{this.iOSCertificates
									.filter(certificate => !certificate.expired)
									.map(certificate => {
										return certificate.fullname === this.state.iOSCodeSigning.certificate
											? <option title={`${certificate.fullname} (${`Expires: ${new Date(certificate.after).toLocaleDateString('en-US')}`})`} value={certificate.fullname} selected>{certificate.fullname} ({`Expires: ${new Date(certificate.after).toLocaleDateString('en-US')}`})</option>
											: <option title={`${certificate.fullname} (${`Expires: ${new Date(certificate.after).toLocaleDateString('en-US')}`})`} value={certificate.fullname}>{certificate.fullname} ({`Expires: ${new Date(certificate.after).toLocaleDateString('en-US')}`})</option>;
									})}
							</Select>
							<div className="toolbar-item-title icon icon-file" />
							<Select ref="iOSProvisioningProfileSelect" attributes={{ style: 'width:200px;' }} title={this.state.iOSCodeSigning.provisioningProfile} change={this.iOSProvisioningProfileSelectValueDidChange.bind(this)}>
								{this.iOSProvisioningProfiles
									.map(profile => {
										return profile.name === this.state.iOSCodeSigning.provisioningProfile
											? <option value={profile.uuid || ''} selected>{profile.name} ({'Expires: ' + new Date(profile.expirationDate).toLocaleDateString('en-US')})</option>
											: <option value={profile.uuid || ''}>{profile.name} ({'Expires: ' + new Date(profile.expirationDate).toLocaleDateString('en-US')})</option>;
									})
								}
							</Select>
							{
								this.state.buildCommand === 'dist-appstore'
									? (
										<div attributes={{ style: 'display:flex;justify-content:center;' }}>
											<Octicon className="toolbar-item-title" name="file-directory" title="Output location" flat="true" />
											<Select ref="iOSOutputSelect" attributes={{ style: 'width:75px;text-align-last: center;' }} title={this.state.iOSCodeSigning.output} change={this.iOSProvisioningProfileSelectValueDidChange.bind(this)}>
												<option title="Xcode" value="xcode" selected>Xcode</option>
												<option title="Folder" value="folder" selected>Folder</option>
											</Select>
										</div>
									)
									: null
							}
						</div>
						<div className="toolbar-right">
							<Button flat="true" icon="x" click={this.expandButtonClicked.bind(this)} />
						</div>
					</div>
				);
			} else if (this.state.platform === 'android') {
				expandedToolbarRow = (
					<div className="toolbar-row">
						<div className="toolbar-center">
							<div className="toolbar-item-title">Path:</div>
							<input
								className="input-text native-key-bindings input keystore-path-input"
								ref="androidKeystorePath"
								value={this.state.androidKeystore.path}
								on={{ change: this.androidKeystoreDidChange }}
							/>
							<Button flat="true" icon="file-directory" click={this.androidKeystoreButtonClicked.bind(this)} />
							<div className="toolbar-item-title">Alias:</div>
							<input
								className="input-text native-key-bindings input"
								ref="androidKeystoreAlias"
								value={this.state.androidKeystore.alias}
								on={{ change: this.androidKeystoreDidChange }}
							/>
							<div className="toolbar-item-title">Password:</div>
							<input
								type="password"
								className="input-text native-key-bindings input"
								ref="androidKeystorePassword"
								value={this.state.androidKeystore.password}
								on={{ change: this.androidKeystoreDidChange }}
							/>
							<div className="toolbar-item-title">Private key password:</div>
							<input
								type="password"
								className="input-text native-key-bindings input"
								ref="androidKeystorePrivateKeyPassword"
								value={this.state.androidKeystore.privateKeyPassword}
								on={{ change: this.androidKeystoreDidChange }}
							/>
						</div>
						<div className="toolbar-right">
							<Button flat="true" icon="x" click={this.expandButtonClicked.bind(this)} />
						</div>
					</div>
				);
			}
		} else if (this.state.buildCommand === 'custom') {
			expandedToolbarRow = (
				<div className="toolbar-row">
					<div className="toolbar-center">
						<div className="toolbar-item-title">Custom arguments:</div>
						<input className="input-text native-key-bindings input keystore-path-input" ref="customArgs" value={this.state.customArgs} attributes={{ placeholder: 'Arguments passed to the "ti build" command ...' }} on={{ change: this.customArgsDidChange }} />
					</div>
					<div className="toolbar-right">
						<Button flat="true" icon="x" click={this.expandButtonClicked.bind(this)} />
					</div>
				</div>
			);
		}

		return (
			<div className={this.state.showingCodeSigning || this.state.buildCommand === 'custom' ? 'appc-toolbar toolbar-expanded ' + this.state.buildCommand : 'appc-toolbar ' + this.state.buildCommand}>

				<div className="toolbar-row">

					<div className="toolbar-left main-toolbar-group">

						<img alt="Titanium Atom" className="logo" src={`${__dirname}/../../images/ti_28.png`} attributes={{ srcset: `${__dirname}/../../images/ti_28.png 1x, ${__dirname}/../../images/ti_56.png 2x, ${__dirname}/../../images/ti_84.png 3x` }} />

						<div className="toolbar-item button build-button-container">
							<Button title="Run" ref="buildButton" className="build-button" custom="true" icon={buildButtonIcon} disabled={this.state.disableUI} click={this.buildButtonClicked.bind(this)} />
							<Select title="Run" ref="buildSelect" className="build-select" custom="true" value={this.state.buildCommand} attributes={{ style: 'width:20px;' }} disabled={this.state.disableUI} change={this.buildSelectValueDidChange.bind(this)}>
								{buildOptions}
							</Select>
						</div>

						<Select title="Select platform" value={this.state.platform} ref="platformSelect" attributes={{ style: 'width:90px;' }} disabled={this.state.disableUI || this.state.buildCommand === 'custom'} change={this.platformSelectValueDidChange.bind(this)}>
							{platformOptions}
						</Select>

						<Select title="Select target" ref="targetSelect" attributes={{ style: 'width:150px;' }} disabled={this.state.disableUI || this.state.buildCommand !== 'run'} value={this.state.selectedTarget[this.state.platform]} change={this.targetSelectValueDidChange.bind(this)}>
							{this.targetOptions.map(target => {
								return target.value === this.state.selectedTarget[this.state.platform]
									? <option platform={this.state.platform} value={target.value} disabled={target.disabled} selected>{target.text}</option>
									: <option platform={this.state.platform} value={target.value} disabled={target.disabled}>{target.text}</option>;
							})
							}
						</Select>

						<Button icon="gear" title="Signing settings..." flat="true" disabled={this.state.disableUI || !this.state.codeSigningAvailable} click={this.expandButtonClicked.bind(this)} />
						<Button icon="bug" title="Debug mode" flat="true" class={!this.state.isDebugMode ? 'disabled' : 'enabled'} click={this.debugModeButtonClick.bind(this)} />
						<Octicon name={this.state.enableLiveview ? 'eye' : 'eye-closed'} title="Liveview" flat="true" disabled={this.shouldDisableLiveView()} click={this.liveViewButtonClicked.bind(this)} />
					</div>

					<Hud ref="hud" />

					<div className="toolbar-right main-toolbar-group">
						<Button icon="plus" title="Create new..." className="button-right" flat="true" disabled={this.state.disableUI || !Project.isTitaniumApp} click={this.generateButtonClicked.bind(this)} />
						<Button icon="trashcan" title="Clean project" className="button-right" flat="true" disabled={this.state.disableUI || !Project.isTitaniumApp} click={this.cleanProjectButtonClicked.bind(this)} />
						<Button icon="terminal" title="Toggle console" className="button-right" flat="true" disabled={this.state.disableUI} click={this.toggleConsoleButtonClicked.bind(this)} />
						<Button icon="x" title="Hide Toolbar" className="button-right" flat="true" click={this.toggle.bind(this)} />
					</div>

				</div>

				{expandedToolbarRow}

			</div>
		);
	}

	/**
	 * Indicate if the LiveView button should be disabled.
	 * @returns {Boolean}
	 */
	shouldDisableLiveView() {
		return this.state.disableUI || !(this.state.buildCommand === 'run' || this.state.buildCommand === 'custom');
	}

	/**
	 * Update component
	 *
	 * @param {Object} opts 	state
	 * @returns {Promise}
	 */
	update(opts) {
		opts && Object.assign(this.state, opts);
		return etch.update(this);
	}

	/**
	 * Read DOM after update
	 */
	readAfterUpdate() {
		this.getState();
	}

	/**
	 * HUD element
	 *
	 * @returns {Object}
	 */
	get hud() {
		return this.refs.hud;
	}

	/**
	 * Get current state
	 *
	 * @returns {Object}
	 */
	getState() {
		const buildCommand = this.refs.buildSelect.selectedOption;
		const platform = this.refs.platformSelect.selectedOption;
		const target = this.refs.targetSelect.selectedOption;
		const targetNode = this.refs.targetSelect.children.find(t => t.props.value === target.value);
		if (targetNode && targetNode.props.value && targetNode.props.platform === platform.value) {
			atom.config.set(`titanium.general.${this.normalizedAppName}.${platform.value}.selectedTarget`, target.value);
		}
		const androidSelectedTarget = Utils.get(`titanium.general.${this.normalizedAppName}.android.selectedTarget`);
		const iosSelectedTarget = Utils.get(`titanium.general.${this.normalizedAppName}.ios.selectedTarget`);

		let targetType = platform.value === 'ios' ? 'simulator' : 'emulator';
		if (this.targets.devices && target.index < this.targets.devices.length + 1) {
			targetType = 'device';
		}

		// Save build command
		atom.config.set(`titanium.general.${this.normalizedAppName}.buildCommand`, buildCommand.value);
		atom.config.set(`titanium.general.${this.normalizedAppName}.buildCommandName`, buildCommand.text);
		atom.config.set(`titanium.general.${this.normalizedAppName}.selectedPlatform`, platform.value);

		Object.assign(this.state, {
			buildCommand: buildCommand.value,
			buildCommandName: buildCommand.text,
			platform: platform.value,
			platformName: platform.text,
			target: target.value,
			targetName: target.text,
			targetType,
			selectedTarget: {
				android: androidSelectedTarget,
				ios: iosSelectedTarget
			}
		});

		if ((this.state.platform === 'ios' && ((this.state.buildCommand === 'run' && this.state.targetType === 'device') || this.state.buildCommand === 'dist-adhoc' || this.state.buildCommand === 'dist-appstore'))
			|| (this.state.platform === 'android' && this.state.buildCommand === 'dist-appstore')) {
			this.state.codeSigningAvailable = true;
		} else {
			this.state.codeSigningAvailable = false;
			this.state.showingCodeSigning = false;
		}

		if (this.refs.iOSCertificateSelect) {
			const selectedValue = this.refs.iOSCertificateSelect.selectedOption.value;
			atom.config.set(`titanium.ios.${this.normalizedAppName}.selectedCertificate`, selectedValue);

			this.state.iOSCodeSigning = {
				certificate: this.refs.iOSCertificateSelect.selectedOption.value,
				provisioningProfile: this.refs.iOSProvisioningProfileSelect.selectedOption.value || '-',
			};

			if (this.state.buildCommand === 'dist-appstore' && this.refs.iOSOutputSelect) {
				this.state.iOSCodeSigning.output = this.refs.iOSOutputSelect.selectedOption.value || 'Xcode';
			}
		}

		if (this.refs.androidKeystorePath) {
			this.state.androidKeystore = {
				path: this.refs.androidKeystorePath.value,
				alias: this.refs.androidKeystoreAlias.value,
				password: this.refs.androidKeystorePassword.value,
				privateKeyPassword: this.refs.androidKeystorePrivateKeyPassword.value
			};
			atom.config.set('titanium.android.keystorePath', this.state.androidKeystore.path);
			atom.config.set('titanium.android.keystoreAlias', this.state.androidKeystore.alias);
		}

		if (this.refs.customArgs) {
			this.state.customArgs = this.refs.customArgs.value;
		}

		return this.state;
	}

	/**
	 * Populate iOS targets
	 */
	populateiOSTargets() {
		this.targets = Appc.iOSTargets();
		this.targetOptions = [];
		this.targetOptions.push({ value: '', text: 'Devices', disabled: true });

		const selectedTarget = Utils.get(`appcelerator-titanium.general.${this.normalizedAppName}.ios.selectedTarget`);
		let hasSelectedTarget = false;
		if (this.targets.devices.length === 0) {
			this.targetOptions.push({ value: '', text: 'No Device Targets', disabled: true });
		} else {
			for (const target of this.targets.devices) {
				if (target.udid === selectedTarget) {
					hasSelectedTarget = true;
				}
				this.targetOptions.push({ value: target.udid, text: target.name });
			}
			if (this.targets.devices.length === 1 && this.targets.devices[0].udid === 'itunes') {
				this.targetOptions.push({ value: '', text: 'No Connected Devices', disabled: true });
			}
		}
		let sdkVersions = Object.keys(this.targets.simulators);
		sdkVersions.sort((a, b) => a < b);
		for (let i = 0, numSdkVersions = sdkVersions.length; i < numSdkVersions; i++) {
			const sdkVersion = sdkVersions[i];
			this.targetOptions.push({ value: '', text: ' ', disabled: true });
			this.targetOptions.push({ value: '', text: 'iOS ' + sdkVersion + ' Simulators', disabled: true });
			for (const simulator of this.targets.simulators[sdkVersion]) {
				if (simulator.udid === selectedTarget) {
					hasSelectedTarget = true;
				}
				const name = simulator.name + ' (' + simulator.version + ')';
				this.targetOptions.push({ value: simulator.udid, text: name });
				if (!this.state.selectedTarget.ios) {
					this.state.selectedTarget.ios = simulator.udid;
				}
			}
		}
		this.targetOptions.push({ value: '', text: '', disabled: true });
		this.targetOptions.push({ value: '', text: '──────────────────', disabled: true });
		this.targetOptions.push({ value: 'refresh', text: 'Refresh Targets' });

		if (!hasSelectedTarget) {
			const simulatorsStart = this.targetOptions.findIndex(option => option.disabled && option.text.includes('Simulators'));
			const target = this.targetOptions[simulatorsStart + 1];
			this.state.selectedTarget.ios = target.value;
		}

		etch.update(this);
	}

	/**
	 * Populate Android targets
	 */
	populateAndroidTargets() {
		this.targets = Appc.androidTargets();
		this.targetOptions = [];
		this.targetOptions.push({ value: '', text: 'Devices', disabled: true });
		const selectedTarget = Utils.get(`appcelerator-titanium.general.${this.normalizedAppName}.android.selectedTarget`);
		let hasSelectedTarget = false;
		if (this.targets.devices.length === 0) {
			this.targetOptions.push({ value: '', text: 'No Connected Devices', disabled: true });
		} else {
			for (const target of this.targets.devices) {
				if (target.id === selectedTarget) {
					hasSelectedTarget = true;
				}
				this.targetOptions.push({ value: target.id, text: target.name });
			}
		}

		for (const [ type, emulators ] of Object.entries(this.targets.emulators)) {
			this.targetOptions.push({ value: '', text: ' ', disabled: true });
			this.targetOptions.push({ value: '', text: type, disabled: true });
			for (const emulator of emulators) {
				if (emulator.id === selectedTarget) {
					hasSelectedTarget = true;
				}
				const emulatorSdkVersion = emulator['sdk-version'] || 'SDK not installed';
				const name = `${emulator.name} (${emulatorSdkVersion})`;
				this.targetOptions.push({ value: emulator.id, text: name });
				if (!this.state.selectedTarget.android) {
					this.state.selectedTarget.android = emulator.id;
				}
			}
			if (this.targets.emulators[type].length === 0) {
				this.targetOptions.push({ value: '', text: `No ${type} Emulators`, disabled: true });
			}
		}

		this.targetOptions.push({ value: '', text: '', disabled: true });
		this.targetOptions.push({ value: '', text: '──────────────────', disabled: true });
		this.targetOptions.push({ value: 'refresh', text: 'Refresh Targets' });

		if (!hasSelectedTarget) {
			const emulatorStart = this.targetOptions.findIndex(option => option.disabled && option.text.includes('AVD'));
			const target = this.targetOptions[emulatorStart + 1];
			this.state.selectedTarget.android = target.value;
		}

		etch.update(this);
	}

	/**
	 * Populate iOS certificates
	 */
	populateiOSCertificates() {
		this.iOSCertificates = Appc.iosCertificates(this.state.buildCommand === 'run' ? 'developer' : 'distribution');
		this.iOSCertificates.sort(function (a, b) {
			return a.fullnane > b.fullnane;
		});
	}

	/**
	 * Populate iOS provisioning profiles
	 */
	populateiOSProvisioningProfiles() {
		let certificate = this.iOSCertificates[0];
		if (this.state.iOSCodeSigning.certificate) {
			certificate = this.iOSCertificates.find(cert => cert.fullname === this.state.iOSCodeSigning.certificate);
		}

		let deployment = 'development';
		if (this.state.buildCommand === 'dist-adhoc') {
			deployment = 'distribution';
		} else if (this.state.buildCommand === 'dist-appstore') {
			deployment = 'appstore';
		}

		this.iOSProvisioningProfiles = Appc.iosProvisioningProfiles(deployment, certificate, Project.appId());

		if (!this.iOSProvisioningProfiles.length) {
			this.iOSProvisioningProfiles.push({
				name: 'No valid matching provisioning profiles'
			});
		}

		this.iOSProvisioningProfiles.sort(function (a, b) {
			var nameA = a.name.toLowerCase();
			var nameB = b.name.toLowerCase();
			if (nameA < nameB) {
				return -1;
			} else if (nameA > nameB) {
				return 1;
			}
			return 0;
		});
	}

	/**
	 * Expand toolbar
	 */
	expand() {
		if (this.state.codeSigningAvailable) {
			this.state.showingCodeSigning = true;
		}
		etch.update(this);
	}

	/**
	 * Build button clicked
	 */
	buildButtonClicked() {
		let command = (this.state.buildInProgress) ? 'appc:stop' : 'appc:build';
		atom.commands.dispatch(atom.views.getView(atom.workspace), command);
	}

	/**
	 * Build select value changed
	 */
	buildSelectValueDidChange() {
		this.getState();
		etch.update(this);
	}

	/**
	 * Platform select value changed
	 */
	platformSelectValueDidChange() {
		this.getState();
		this.refreshTargets();
		etch.update(this);
	}

	refreshTargets() {
		switch (this.state.platform) {
			case 'ios':
				this.populateiOSTargets();
				break;
			case 'android':
				if (this.state.buildCommand === 'dist-adhoc') {
					this.refs.buildSelect.update({ value: 'dist-appstore' });
					this.getState();
				}
				this.populateAndroidTargets();
				break;
		}
	}

	/**
	 * Target select value changed
	 *
	 * @param {Object} event 	change event object
	 */
	targetSelectValueDidChange(event) {
		if (event.target.value === 'refresh') {
			this.targets = [];
			this.targetOptions = [ { value: '', text: '', disabled: true } ];
			this.update({ disableUI: true });
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
				}
				this.hud.displayDefault();
				this.getState();
				this.update({ disableUI: false });
			});
		} else {
			this.getState();
			etch.update(this);
		}
	}

	/**
	 * iOS certificate select value changed
	 */
	iOSCertificateSelectValueDidChange() {
		this.getState();
		this.populateiOSProvisioningProfiles();
		etch.update(this);
	}

	/**
	 * iOS provisioning profile select changed
	 */
	iOSProvisioningProfileSelectValueDidChange() {
		// Save selected provisioning profile for this project
		const selectedValue = this.refs.iOSProvisioningProfileSelect.selectedOption.value;
		atom.config.set(`titanium.ios.${this.normalizedAppName}.selectedProvisioningProfile`, selectedValue);
		this.getState();
	}

	/**
	 * Output select changed
	 */
	iOSOutputSelectValueDidChange() {
		const selectedValue = this.refs.iOSOutputSelect.selectedOption.value;
		atom.config.set(`titanium.ios.${this.normalizedAppName}.selectedOutput`, selectedValue);
		this.getState();
	}

	/**
	 * Expand button clicked
	 */
	expandButtonClicked() {
		if (this.state.codeSigningAvailable) {
			this.state.showingCodeSigning = !this.state.showingCodeSigning;
		}
		etch.update(this);
	}

	/**
	 * Android keystore button clicked
	 */
	async androidKeystoreButtonClicked() {
		const { filePaths } = await remote.dialog.showOpenDialog({ properties: [ 'openFile', 'showHiddenFiles' ] });
		if (filePaths && filePaths[0].length > 0) {
			this.state.androidKeystore.path = filePaths[0];
		}
		etch.update(this);
	}

	/**
	 * Android keystore changed
	 */
	androidKeystoreDidChange() {
		this.getState();
		etch.update(this);
	}

	/**
	 * Custom args changed
	 */
	customArgsDidChange() {
		// Persist custom args for cross-launch usage
		atom.config.set('titanium.general.customArgs', this.state.customArgs || '');

		this.getState();
		etch.update(this);
	}

	/**
	 * Generate button clicked
	 */
	generateButtonClicked() {
		atom.commands.dispatch(atom.views.getView(atom.workspace), 'appc:generate');
	}

	/**
	 * Console button clicked
	 */
	toggleConsoleButtonClicked() {
		atom.commands.dispatch(atom.views.getView(atom.workspace), 'appc:console:toggle');
	}

	/**
	 * LiveView toggle button clicked
	 */
	liveViewButtonClicked() {
		this.state.enableLiveview = !this.state.enableLiveview;
		this.getState();

		atom.config.set('titanium.general.liveviewEnabled', this.state.enableLiveview);
		etch.update(this);
	}

	/**
	 * Toggle debug mude
	 */
	debugModeButtonClick() {
		this.state.isDebugMode = !this.state.isDebugMode;
		this.getState();

		atom.config.set('titanium.general.isDebugMode', this.state.isDebugMode);
		etch.update(this);
	}

	toggle() {
		if (this.panel.isVisible()) {
			atom.config.set('titanium.general.showToolbar', false);
			this.panel.hide();
		} else {
			atom.config.set('titanium.general.showToolbar', true);
			this.panel.show();
		}
	}

	/**
	 * Dispatch the clean command when the clean button is clicked
	 */
	cleanProjectButtonClicked() {
		atom.commands.dispatch(atom.views.getView(atom.workspace), 'appc:clean');
	}
}
