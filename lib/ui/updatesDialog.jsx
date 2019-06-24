/** @babel */
/** @jsx etch.dom */

import etch from 'etch';
import { updates } from 'titanium-editor-commons';

/**
 * Generate component dialog
 */
export default class UpdatesDialog {

	/**
	 * Constructor
	 *
	 * @param {Object} 		opts 			arguments
	 * @param {Function}	opts.install		install callback function
	 * @param {Function}	opts.cancel		cancel callback function
	 */
	constructor(opts) {
		this.installButtonEnabled = true;
		this.opts = opts;
		this.type = '';
		this.focus = '';
		this.state = {
			checked: {},
			checking: false,
			updates: [],
			installs: []
		};
		this.pullUpdate();
		etch.initialize(this);
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
		const items = this.state.updates.map((item) => (
			<div className="row">
				<div className="col">
					<input className="input-checkbox" type="checkbox" ref={item.productName} checked={item.selected} on={{ change: (event) => this.checkedInstall(event, item) }} />
					{item.productName}
				</div>
				<div className="col">
					{item.latestVersion}
				</div>
				<div className="col">
					<a href={item.releaseNotes}>
						<div className="icon-book" />
					</a>
				</div>
			</div>
		));
		return (
			<div className="appc-update-dialog" on={{ keyup: this.onKeyUp }}>
				<div className="title">Updates Available</div>
				<div className="spinner loading loading-spinner-large" attributes={this.state.checking ? { style: 'display:block;' } : { style: 'display:none;' }} />
				{items}
				<div className="row-buttons">
					<button className="btn" attributes={{ tabindex: '10' }} on={{ click: this.cancelButtonClicked }}>Cancel</button>
					<button className="btn" ref="install" disabled={!this.installButtonEnabled} attributes={{ tabindex: '11' }} on={{ click: this.installButtonClicked }}>Install</button>
				</div>
			</div>
		);
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
	 * Check for updates
	 */
	async pullUpdate() {
		this.state.checking = true;
		this.state.updates = await updates.checkAllUpdates();
		this.state.checking = false;
		for (let index = 0; index < this.state.updates.length; index++) {
			this.state.updates[index].selected = true;
		}
		etch.update(this);
	}

	checkedInstall(event, item) {
		const index = this.state.updates.findIndex(({ productName }) => productName === item.productName);
		this.state.updates[index].selected = !this.state.updates[index].selected;
	}

	/**
	 * Cancel button clicked
	 */
	cancelButtonClicked() {
		this.cancel();
	}

	/**
	 * Generate button clicked
	 */
	installButtonClicked() {
		this.submit();
	}

	/**
	 * Call cancel callback function
	 */
	cancel() {
		this.opts.cancel && this.opts.cancel();
	}

	/**
	 * Collate arguments and call generate callback function
	 */
	submit() {
		this.state.updates.sort((curr, prev) => curr.priority - prev.priority);
		let args = this.state.updates;
		this.opts.install && this.opts.install(this.type, args);

	}

	/**
	 * Key up event handler
	 *
	 * @param {Object} event 	key up event object
	 */
	onKeyUp(event) {
		if (event.keyCode === 27) {
			this.cancel();
		} else if (event.keyCode === 13) {
			this.submit();
		}
	}
}
