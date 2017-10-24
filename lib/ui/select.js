/** @babel */
/** @jsx etch.dom */

import etch from 'etch';

/**
 * Select
 */
export default class Select {

    /**
     * 
     * @param {Object}      opts 
     * @param {String}      opts.className
     * @param {Boolean}     opts.custom
     * @param {Object}      opts.attributes
     * @param {Boolean}     opts.disabled
     * @param {Function}    opts.change
     * @param {Array}       children 
     */
    constructor(opts, children) {
        this.opts = opts;
        this.opts.className = opts.className ? opts.className : '';
        this.children = children;
        // this.selectedOption = {
        //     value: this.children[0].props.value,
        //     text: this.children[0].children[0].text
        // }
        etch.initialize(this);
    }

    render() {
		return <select className={this.className()} ref='select' attributes={this.opts.attributes} disabled={this.opts.disabled} on={{change: this.valueDidChange}}>
            {this.children}
        </select>
	}

	update(opts, children) {
        opts && Object.assign(this.opts, opts);
        if (children) this.children = children;
        etch.update(this);

        // now update value to ensure correct selected option
        if (opts.value) {
            this.refs.select.value = opts.value;
        }
    }
    
    // readAfterUpdate() {
    //     const option = this.refs.select.options[this.refs.select.selectedIndex];
    //     this.selectedOption = {
    //         value: option.value,
    //         text: option.text
    //     }
    //     console.log('rau' + this.selectedOption);
    // }

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
            }
        }
        
        return {
            value: null,
            text: null,
            index: -1
        }
    }

    className() {
        let className = `select ${this.opts.className}`;
        if (!this.opts.custom) className += ' element';
        if (this.opts.disabled) className += ' disabled';
        return className;
    }

}