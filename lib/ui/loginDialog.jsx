/** @babel */
/** @jsx etch.dom */

import etch from 'etch';
/**
 * Login dialog
 */
export default class LoginDialog {

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
			focus: 'username',
		};
		this.login = {
			username: '',
			password: '',
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
		return (
			<div className="appc-toolbar appc-login-dialog" on={{ keyup: this.onKeyUp }}>
				<div className="row">
					<p>Appcelerator Login:</p>
				</div>
				<div className="row">
					<div className="title">Appcelerator ID:</div>
					<input className="input-text native-key-bindings input" ref="username" placeholder="Appcelerator ID" attributes={{ tabindex: '1', dataLabel: 'username' }} on={{ input: this.textInputDidChange }} />
				</div>
				<div className="row">
					<div className="title">Password:</div>
					<input className="input-text native-key-bindings input" ref="password" placeholder="Password" type="password" attributes={{ tabindex: '2', dataLabel: 'password' }} on={{ input: this.textInputDidChange }} />
				</div>
				<div className="row-buttons">
					<button className="btn" attributes={{ tabindex: '3' }} disabled={this.state.executing} on={{ click: this.cancelButtonClicked }}>Cancel</button>
					<button className="btn btn-primary inline-block-tight" ref="submit" disabled={!this.state.submitButtonEnabled || this.state.executing} attributes={{ tabindex: '4' }} on={{ click: this.submitButtonClicked }}>Login</button>
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
	 * Text input changed
	 *
	 * @param {Object} event	change event
	 */
	textInputDidChange(event) {
		this.login[event.target.attributes.dataLabel.value] = event.target.value;
		this.enableSubmit();
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
	 * Enabled or disable submit button
	 */
	enableSubmit() {
		let enabled = this.login.username.length > 0 && this.login.password.length > 0;
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
		this.opts.callback && this.opts.callback(this.login);
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
