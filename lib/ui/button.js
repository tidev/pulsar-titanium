/** @babel */
/** @jsx etch.dom */

import etch from 'etch';

/**
 * Button
 */
export default class Button {

	/**
	 * Constructor
	 *
	 * @param {Object}      opts 			arguments
	 * @param {Boolean}     opts.flat		no border
	 * @param {String}      opts.icon		icon class
	 * @param {String}      opts.className	custom css class
	 * @param {Boolean}     opts.custom		custom override
	 * @param {Boolean}     opts.disabled	is disabled
	 * @param {Function}    opts.click		click event handler
	 */
	constructor(opts) {
		this.opts = opts;
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
		return <button className={this.className()} disabled={this.opts.disabled} on={{ click: this.opts.click }} />;
	}

	/**
	 * Update component
	 *
	 * @param {Object} opts 	state
	 * @returns {Promise}
	 */
	update(opts) {
		opts && Object.assign(this.opts, opts);
		return etch.update(this);
	}

	/**
	 * Returns DOM element class
	 *
	 * @returns {String}
	 */
	className() {
		let className = `button ${this.opts.className} icon icon-${this.opts.icon}`;
		if (!this.opts.custom) {
			className += (this.opts.flat) ? ' toolbar-item-flat' : ' toolbar-item';
		}
		if (this.opts.disabled) {
			className += ' disabled';
		}
		return className;
	}
}
