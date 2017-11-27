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

	render() {
		return <select className={this.className()} ref="select" attributes={this.opts.attributes} disabled={this.opts.disabled} on={{ change: this.valueDidChange }}>
			{this.children}
		</select>;
	}

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

	async destroy() {
		await etch.destroy(this);
	}

	valueDidChange(event) {
		this.opts.change(event);
	}

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
