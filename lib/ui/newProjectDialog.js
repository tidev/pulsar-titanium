/** @babel */
/** @jsx etch.dom */

import { remote } from 'electron';
import { homedir } from 'os';
import fs from 'fs';
import path from 'path';
import etch from 'etch';
import Button from './button';
import Utils from '../utils';
import Appc from '../appc';

/**
 * New project component dialog
 */
export default class NewProjectDialog {

	/**
	 * Constructor
	 *
	 * @param {Object} 		opts 			arguments
	 * @param {Function}	opts.callback	callback function
	 * @param {Function}	opts.cancel		cancel callback function
	 */
	constructor(opts) {
		this.opts = opts;
		this.state = {
			focus: 'name',
			submitButtonEnabled: false,
			locationExists: false,
			executing: false,
			session: Appc.session()
		};
		this.project = {
			name: '',
			id: '',
			platforms: Utils.platforms(),
			location: homedir(),
			enableServices: true,
			enableHyperloop: true
		};
		etch.initialize(this);
		this.setFocus();
	}

	/**
	 * Clean up
	 */
	async destroy() {
		await etch.destroy(this);
	}

	/**
	 * Current state virtual DOM element
	 *
	 * @returns {Object}
	 */
	render() {
		/* eslint-disable max-len */
		let platformOptions = [];
		const platforms = Utils.platforms();
		for (let i = 0, numPlatforms = platforms.length; i < numPlatforms; i++) {
			platformOptions.push(<button className={this.classNameForPlatform(platforms[i], 'btn')} ref={`platform${platforms[i]}`} disabled={this.state.executing} on={{ click: this.platformClicked }}>{Utils.nameForPlatform(platforms[i])}</button>);
		}

		let projectLocation = <div className="row" />;
		if (this.project.name && this.project.name.length > 0) {
			if (this.state.locationExists) {
				projectLocation = <div className="row">
					<p class="disabled error">{`${path.join(this.project.location, this.project.name)}`} already exists</p>
				</div>;
			} else {
				projectLocation = <div className="row">
					<p class="disabled">Project will be created at {`${path.join(this.project.location, this.project.name)}`}</p>
				</div>;
			}
		}
		let services = '';
		if (this.project.enableServices) {
			services = [
				<div className="row">
					<p class="disabled">App will be registered with the Axway AMPLIFY Platform and mobile backend services enabled.</p>
				</div>,
				<div className="row">
					<div className="title">User:</div>
					<div className="value">{this.state.session.firstname} {this.state.session.lastname} ({this.state.session.username})</div>
				</div>,
				<div className="row">
					<div className="title">Organization:</div>
					<div className="value">{this.state.session.org_name} ({this.state.session.org_id})</div>
				</div>,
				<div className="row">
					<div className="title">Enable Hyperloop:</div>
					<input class="input-checkbox" type="checkbox" ref="enableHyperloop" disabled={this.state.executing} checked={this.project.enableHyperloop} on={{ change: this.enableHyperloopDidChange }} />
				</div>
			];
		}
		return (
			<div className="appc-toolbar appc-new-project-dialog" on={{ keyup: this.onKeyUp }}>
				<div className="row">
					<div className="title">Name:</div>
					<input className="input-text native-key-bindings input" ref="name" placeholder="MyApp" disabled={this.state.executing} attributes={{ tabindex: '1', dataLabel: 'name' }} on={{ input: this.textInputDidChange }} />
				</div>
				<div className="row">
					<div className="title">ID:</div>
					<input className="input-text native-key-bindings input" ref="id" placeholder="com.example.myapp" disabled={this.state.executing} attributes={{ tabindex: '2', dataLabel: 'id' }} on={{ input: this.textInputDidChange }} />
				</div>
				<div className="row">
					<div className="title">Platforms:</div>
					<div class="btn-group">
						{platformOptions}
					</div>
				</div>
				<div className="row">
					<div className="title">Location:</div>
					<input className="input-text native-key-bindings input" ref="location" placeholder="~/Documents/titanium" value={this.project.location} disabled={this.state.executing} attributes={{ tabindex: '4', dataLabel: 'location' }} on={{ input: this.textInputDidChange }} />
					<Button flat="true" icon="file-directory" disabled={this.state.executing} click={this.locationButtonClicked.bind(this)} />
				</div>
				{projectLocation}
				<div className="row">
					<div className="title">Enable Services:</div>
					<input class="input-checkbox" type="checkbox" ref="enableServices" disabled={this.state.executing} checked={this.project.enableServices} on={{ change: this.enableServicesDidChange }} />
				</div>
				{services}
				<div className="row-buttons">
					<button class="btn" attributes={{ tabindex: '10' }} disabled={this.state.executing} on={{ click: this.cancelButtonClicked }}>Cancel</button>
					<button class="btn btn-primary inline-block-tight" ref="submit" disabled={!this.state.submitButtonEnabled || this.state.executing} attributes={{ tabindex: '11' }} on={{ click: this.submitButtonClicked }}>Create</button>
					<div className="hud-spinner loading loading-spinner-tiny" attributes={this.state.executing ? { style: 'display:block;' } : { style: 'display:none;' }} />
				</div>
			</div>
		);
		/* eslint-enable max-len */
	}

	/**
	 * Update component
	 *
	 * @param {Object} opts 	state
	 * @returns {Promise}
	 */
	update() {
		return etch.update(this);
	}

	/**
	 * Query DOM after update
	 */
	readAfterUpdate() {
		this.enableSubmit();
	}

	/**
	 * Write to DOM after update
	 */
	writeAfterUpdate() {
		this.setFocus();
	}

	/**
	 * Returns class name with added 'selected' class
	 *
	 * @param {String} platform 	target platform
	 * @param {String} className 	defaul element class name
	 * @returns {String}
	 */
	classNameForPlatform(platform, className) {
		if (this.project.platforms.includes(platform)) {
			return `${className} selected`;
		}
		return className;
	}

	/**
	 * Platform button clicked
	 *
	 * @param {Object} event 	click event
	 */
	platformClicked(event) {
		let platform;
		switch (event.target) {
			case this.refs.platformios:
				platform = 'ios';
				break;
			case this.refs.platformandroid:
				platform = 'android';
				break;
			case this.refs.platformwindows:
				platform = 'windows';
				break;
		}
		const index = this.project.platforms.indexOf(platform);
		if (index === -1) {
			this.project.platforms.push(platform);
		} else {
			this.project.platforms.splice(index, 1);
		}
		etch.update(this);
	}

	/**
	 * Location button clicked
	 */
	locationButtonClicked() {
		const filePaths = remote.dialog.showOpenDialog({ defaultPath: this.project.location, buttonLabel: 'Choose', properties: [ 'openDirectory', 'createDirectory' ] });
		if (filePaths && filePaths[0].length > 0) {
			this.project.location = filePaths[0];
		}
		this.validateLocation();
		etch.update(this);
	}

	/**
	 * Text input changed
	 *
	 * @param {Object} event	change event
	 */
	textInputDidChange(event) {
		this.project[event.target.attributes.dataLabel.value] = event.target.value;
		this.validateLocation();
		this.enableSubmit();
		etch.update(this);
	}

	/**
	 * Enable services checkbox did change
	 */
	enableServicesDidChange() {
		this.project.enableServices = this.refs.enableServices.checked;
		etch.update(this);
	}

	/**
	 * Enable hyperloop checkbox did change
	 */
	enableHyperloopDidChange() {
		this.project.enableHyperloop = this.refs.enableHyperloop.checked;
		etch.update(this);
	}

	/**
	 * Cancel button clicked
	 */
	cancelButtonClicked() {
		this.cancel();
	}

	/**
	 * Submit button clicked
	 */
	submitButtonClicked() {
		this.submit();
	}

	/**
	 * Set DOM element focus
	 */
	setFocus() {
		setTimeout(() => {
			if (this.state.focus) {
				this.refs[this.state.focus].focus();
				this.state.focus = null;
			}
		}, 0);
	}

	/**
	 * Validate project location
	 */
	validateLocation() {
		if (!this.project.name || this.project.name.length === 0) {
			this.state.locationExists = false;
			return;
		}
		const location = path.join(this.project.location, this.project.name);
		if (fs.existsSync(location)) {
			this.state.locationExists = true;
		} else {
			this.state.locationExists = false;
		}
	}

	/**
	 * Enabled or disable submit button
	 */
	enableSubmit() {
		let enabled = this.project.name.length > 0 && this.project.id.length > 0 && this.project.platforms.length > 0 && this.state.locationExists === false;
		if (this.state.submitButtonEnabled !== enabled) {
			this.state.submitButtonEnabled = enabled;
			etch.update(this);
		}
	}

	/**
	 * Call cancel callback function
	 */
	cancel() {
		if (!this.state.executing) {
			this.opts.cancel && this.opts.cancel();
		}
	}

	/**
	 * Collate arguments and call callback function
	 */
	submit() {
		if (!this.state.submitButtonEnabled) {
			return;
		}
		this.state.executing = true;
		this.opts.callback && this.opts.callback(this.project);
		etch.update(this);
	}

	/**
	 * Key up event handler
	 *
	 * @param {Object} event 	key up event object
	 */
	onKeyUp(event) {
		if (!this.state.executing) {
			if (event.keyCode === 27) {
				this.cancel();
			} else if (event.keyCode === 13) {
				this.submit();
			}
		}
	}
}
