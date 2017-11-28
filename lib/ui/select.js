/** @babel */
/** @jsx etch.dom */

import etch from 'etch';

/**
 * Select
 */
export default class Select {

	/**
	 * Constructor
	 *
	 * @param {Object}      opts 				arguments
	 * @param {String}      opts.className		custom css class
	 * @param {Boolean}     opts.custom			custom override
	 * @param {Object}      opts.attributes		HTML attributes
	 * @param {Boolean}     opts.disabled		is disabled
	 * @param {Function}    opts.change			change event handler
	 * @param {Array}       children 			child elements
	 */
	constructor(opts, children) {
		this.opts = opts;
		this.opts.className = opts.className ? opts.className : '';
		this.children = children;
		etch.initialize(this);

		// now update value to ensure correct selected option
		if (opts.value) {
			this.refs.select.value = opts.value;
		}
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
		return <select className={this.className()} ref="select" attributes={this.opts.attributes} disabled={this.opts.disabled} on={{ change: this.valueDidChange }}>
			{this.children}
		</select>;
	}

	/**
	 * Update component
	 *
	 * @param {Object} opts 	state
	 * @param {Array} children	child DOM elements
	 */
	update(opts, children) {
		opts && Object.assign(this.opts, opts);
		if (children) {
			this.children = children;
		}
		etch.update(this);

		// now update value to ensure correct selected option
		if (opts.value) {
			this.refs.select.value = opts.value;
		}
	}

	/**
	 * Value changed
	 *
	 * @param {Object} event 	change event object
	 */
	valueDidChange(event) {
		this.opts.change(event);
	}

	/**
	 * Selected option
	 *
	 * @returns {Object}
	 */
	get selectedOption() {
		const index = this.refs.select.selectedIndex;
		const option = this.refs.select.options[index];
		if (option) {
			return {
				value: option.value,
				text: option.text,
				index
			};
		}

		return {
			value: null,
			text: null,
			index: -1
		};
	}

	/**
	 * DOM style class
	 *
	 * @returns {String}
	 */
	className() {
		let className = `select ${this.opts.className}`;
		if (!this.opts.custom) {
			className += ' toolbar-item';
		}
		if (this.opts.disabled) {
			className += ' disabled';
		}
		return className;
	}

}
