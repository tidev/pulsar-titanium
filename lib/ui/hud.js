/** @babel */
/** @jsx etch.dom */

import etch from 'etch';

etch.setScheduler(atom.views);

/**
 * HUD
 */
export default class Hud {

	/**
	 * Constructor
	 */
	constructor() {
		this.state = {
			icon: `${__dirname}/../../images/appc_44.png`,
			text: 'Ready',
			spinner: false
		};
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
		return <div className="toolbar-item hud">
			<img className="hud-icon" src={this.state.icon} />
			<p className="hud-message">{this.state.text}</p>
			<div className="hud-spinner loading loading-spinner-tiny" attributes={this.state.spinner ? { style: 'display:block;' } : { style: 'display:none;' }} />
		</div>;
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
	 * Display HUD message
	 *
	 * @param {Object}  opts 			arguments
	 * @param {String}  opts.icon		icon file path
	 * @param {String}  opts.text		message text
	 * @param {Boolean} opts.spinner	display spinner
	 * @param {Boolean} opts.default	save default message
	 */
	display(opts) {
		if (opts.icon) {
			this.state.icon = opts.icon;
		}

		if (opts.text) {
			this.state.text = opts.text;
		}

		if (opts.spinner) {
			this.state.spinner = opts.spinner;
		} else {
			this.state.spinner = false;
		}

		if (opts.default) {
			this.default = opts;
		}

		etch.update(this);
	}

	/**
	 * Display saved default message
	 */
	displayDefault() {
		this.display(this.default);
	}
}
