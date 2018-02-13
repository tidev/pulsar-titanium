/** @babel */
/** @jsx etch.dom */

import etch from 'etch';

/**
 * Generate component dialog
 */
export default class GenerateDialog {

	/**
	 * Constructor
	 *
	 * @param {Object} 		opts 			arguments
	 * @param {Function}	opts.generate	generate callback function
	 * @param {Function}	opts.cancel		cancel callback function
	 */
	constructor(opts) {
		this.opts = opts;
		this.type = 'controller';
		this.focus = 'name';
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
		let argumentInputs = <div />;
		if (this.type === 'controller' || this.type === 'view' || this.type === 'style' || this.type === 'widget') {
			argumentInputs = (
				<div className="row">
					<div className="title input-title">Name:</div>
					<input className="input-text native-key-bindings input" ref="name" attributes={{ tabindex: '1' }} on={{ input: this.textInputDidChange }} />
				</div>
			);
		} else if (this.type === 'model') {
			argumentInputs = [
				<div className="row">
					<div className="title input-title">Name:</div>
					<input className="input-text native-key-bindings input" ref="name" attributes={{ tabindex: '1' }} on={{ input: this.textInputDidChange }} />
				</div>,
				<div className="row">
					<div className="title input-title">Type:</div>
					<input className="input-text native-key-bindings input" ref="modelType" placeholder="sql | properties" attributes={{ tabindex: '2' }} on={{ input: this.textInputDidChange }} />
				</div>,
				<div className="row">
					<div className="title input-title">Columns:</div>
					<input className="input-text native-key-bindings input" ref="modelColumns" placeholder="name:type name:type ..." attributes={{ tabindex: '3' }} on={{ input: this.textInputDidChange }} />
				</div>
			];
		}

		return (
			<div className="appc-generate-dialog" on={{ keyup: this.onKeyUp }}>
				<div className="row">
					<div className="title">Type:</div>
					<div className="types">
						<div ref="typeController" on={{ click: this.componentTypeClicked }} className={this.classNameForType('controller', 'icon icon-code')}>Controller</div>
						<div ref="typeView" on={{ click: this.componentTypeClicked }} className={this.classNameForType('view', 'icon icon-eye')}>View</div>
						<div ref="typeStyle" on={{ click: this.componentTypeClicked }} className={this.classNameForType('style', 'icon icon-pencil')}>Style</div>
						<div ref="typeModel" on={{ click: this.componentTypeClicked }} className={this.classNameForType('model', 'icon icon-puzzle')}>Model</div>
						<div ref="typeWidget" on={{ click: this.componentTypeClicked }} className={this.classNameForType('widget', 'icon icon-file-submodule')}>Widget</div>
						<div ref="typeJmk" on={{ click: this.componentTypeClicked }} className={this.classNameForType('jmk', 'icon icon-file-code')}>JMK</div>
					</div>
				</div>
				{argumentInputs}
				<div className="row-buttons">
					<button class="btn" attributes={{ tabindex: '10' }} on={{ click: this.cancelButtonClicked }}>Cancel</button>
					<button class="btn btn-primary inline-block-tight" ref="generate" disabled={!this.generateButtonEnabled} attributes={{ tabindex: '11' }} on={{ click: this.generateButtonClicked }}>Generate</button>
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
	 * Query DOM after update
	 */
	readAfterUpdate() {
		this.enableGenerate();
	}

	/**
	 * Write to DOM after update
	 */
	writeAfterUpdate() {
		this.setFocus();
	}

	/**
	 * DOM class for given type, appends selected if current type
	 *
	 * @param {String} type 		component type
	 * @param {String} className 	style class
	 * @returns {String}
	 */
	classNameForType(type, className) {
		if (this.type === type) {
			return `${className} selected`;
		}
		return className;
	}

	/**
	 * Text input changed
	 */
	textInputDidChange() {
		this.enableGenerate();
	}

	/**
	 * Component type clicked
	 *
	 * @param {Object} event 	click event object
	 */
	componentTypeClicked(event) {
		switch (event.target) {
			case this.refs.typeController:
				this.type = 'controller';
				this.focus = 'name';
				break;
			case this.refs.typeView:
				this.type = 'view';
				this.focus = 'name';
				break;
			case this.refs.typeStyle:
				this.type = 'style';
				this.focus = 'name';
				break;
			case this.refs.typeModel:
				this.type = 'model';
				this.focus = 'name';
				break;
			case this.refs.typeWidget:
				this.type = 'widget';
				this.focus = 'name';
				break;
			case this.refs.typeJmk:
				this.type = 'jmk';
				this.focus = 'generate';
				break;
		}

		etch.update(this);
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
	generateButtonClicked() {
		this.submit();
	}

	/**
	 * Set DOM element focus
	 */
	setFocus() {
		setTimeout(() => {
			if (this.focus) {
				this.refs[this.focus].focus();
				this.focus = null;
			}
		}, 0);
	}

	/**
	 * Enabled or disable generate button
	 */
	enableGenerate() {
		let enabled;
		if (this.type === 'controller' || this.type === 'view' || this.type === 'style' || this.type === 'widget') {
			enabled = (this.refs.name.value.length > 0);
		} else if (this.type === 'model') {
			enabled = (this.refs.name.value.length > 0 && this.refs.modelType.value.length > 0 && this.refs.modelColumns.value.length > 0);
		} else if (this.type === 'jmk') {
			enabled = true;
		}

		if (this.generateButtonEnabled !== enabled) {
			this.generateButtonEnabled = enabled;
			etch.update(this);
		}
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
		if (!this.generateButtonEnabled) {
			return;
		}
		let args = [];
		if (this.type === 'controller' || this.type === 'view' || this.type === 'style' || this.type === 'widget') {
			args = [ this.refs.name.value ];
		} else if (this.type === 'model') {
			args = [ this.refs.name.value, this.refs.modelType.value ];
			args = args.concat(this.refs.modelColumns.value.split(' '));
		}
		this.opts.generate && this.opts.generate(this.type, args);
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
