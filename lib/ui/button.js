/** @babel */
/** @jsx etch.dom */

import etch from 'etch';

/**
 * Button
 */
export default class Button {

    /**
     * 
     * @param {Object}      opts 
     * @param {String}      opts.flat
     * @param {String}      opts.icon
     * @param {String}      opts.className
     * @param {Boolean}     opts.custom
     * @param {Boolean}     opts.disabled
     * @param {Function}    opts.click
     */
    constructor(opts) {
        this.opts = opts;
        etch.initialize(this);
    }

    render() {
		return <button className={this.className()} disabled={this.opts.disabled} on={{click:this.opts.click}} />
	}

	update(opts) {
        opts && Object.assign(this.opts, opts);
		return etch.update(this);
	}

	async destroy() {
		await etch.destroy(this);
    }
    
    className() {
        let className = `button ${this.opts.className} icon icon-${this.opts.icon}`;
        if (!this.opts.custom) className += (this.opts.flat) ? ' element-flat' : ' element';
        if (this.opts.disabled) className += ' disabled';
        return className;
    }
}