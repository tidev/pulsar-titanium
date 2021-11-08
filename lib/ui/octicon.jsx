/** @babel */
/** @jsx etch.dom */

import etch from 'etch';
import octicons from '@primer/octicons';

export class Octicon {
	/**
	 *
	 * @param {Object} opts - Options
	 * @param {String} opts.name - The octicons icon name
	 * @param {String[]} opts.classNames - Extra classnames to include
	 * @param {Boolean} opts.spin - Whether the icon should spin
	 * @param {Boolean} opts.disabled - Whether the icon should be in disabled state, also stops also handlers
	 * @param {String} opts.title - Title for the tooltip
	 */
	constructor(opts) {
		if (!opts || !opts.name) {
			throw new Error('A name is required');
		}

		const isValid = octicons[opts.name];
		if (!isValid) {
			throw new Error(`${opts.name} is not a valid octicon`);
		}

		if (opts.spin) {
			opts.spin = true;
		}

		this.opts = opts;

		etch.initialize(this);
		Octicon.setScheduler(atom.views);
	}

	static getScheduler () {
		return etch.getScheduler();
	}

	static setScheduler (scheduler) {
		etch.setScheduler(scheduler);
	}

	update (opts) {
		const oldOpts = this.opts;
		this.opts = Object.assign({}, oldOpts, opts);
		return etch.update(this);
	}

	render () {
		const { className, disabled, name, spin, title } = this.opts;
		const classNames = [ 'etch-octicon', `etch-octicon-${name}` ];

		if (spin) {
			classNames.push('spin-etch-octicon');
		}

		if (className) {
			classNames.push(className);
		}

		if (disabled) {
			classNames.push('disabled');
		}

		const fill = getComputedStyle(document.querySelector('atom-panel')).color;
		const octicon = octicons[name].toSVG({ fill });

		const handlers = disabled ? {} : { click: this.opts.click };

		return (
			<span innerHTML={octicon} className={classNames.join(' ')} on={handlers} style={{ display: 'flex', alignItems: 'center' }} title={title} />
		);
	}
}
