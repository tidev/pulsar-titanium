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
	 * @param {String}      opts.icon		icon class
	 * @param {String}      opts.className	custom css class
	 * @param {String}      opts.title		title
	 * @param {Boolean}     opts.flat		no border
	 * @param {Boolean}     opts.custom		custom override
	 * @param {Boolean}     opts.disabled	is disabled, not clickable
	 * @param {Boolean}     opts.grayed		is grayed out, but clickable
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
		return <button className={this.className()} title={this.opts.title || ""} disabled={this.opts.disabled} on={{ click: this.opts.click }} />;
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
		if (this.opts.grayed) {
			className += ' grayed';
		}
		return className;
	}
}
