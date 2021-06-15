'use babel';

import { remote } from 'electron';

const { TouchBar } = remote;

export default class TouchBarManager {

	constructor() {
		this.touchBar = new TouchBar([]);
		this.items = [];
		this.show();
	}

	/**
	 * Clear all buttons from the TouchBar.
	 *
	 * @memberof TouchBarManager
	 */
	clear() {
		this.items = [];
		this.show();
	}

	/**
	 * Add a single item to the TouchBar.
	 *
	 * @param {Object} item - Details for the item to be added to the TouchBar.
	 * @param {String} item.label - Label to identify the item.
	 * @param {Object} item.tbItem - Item to be added to the TouchBar.
	 * @param {Number} [item.place=1] - Place for the item on the TouchBar, with 1 being leftmost item.
	 * @param {Boolean} [item.show=true] - Layout the TouchBar once the item is added.
	 * @memberof TouchBarManager
	 */
	addItem({ label, place = 1, show = true, tbItem } = {}) {
		this.items.push({ label, place, tbItem });
		this.items.sort((a, b) => a.place - b.place);
		if (show) {
			this.show();
		}
	}

	/**
	 * Clear the TouchBar, add multiple items, then show the items.
	 *
	 * @param {Array} items - Array of items to add.
	 * @memberof TouchBarManager
	 */
	addItems(items) {
		this.clear();
		for (const item of items) {
			this.addItem({ ...item, show: false });
		}
		this.show();
	}

	/**
	 * Remove an item from the TouchBar.
	 *
	 * @param {String} label - Label used to identify the item.
	 * @memberof TouchBarManager
	 */
	removeItem(label) {
		this.items = this.items.filter(existing => existing.label !== label);
		this.show();
	}

	/**
	 * Replace an item on the TouchBar.
	 *
	 * @param {Object} opts - Various options.
	 * @param {String} opts.label - Label to identify the new item.
	 * @param {Object} opts.tbItem - Item to add to TouchBar.
	 * @param {String} opt.toReplace - Label to identify the item to replace.
	 * @memberof TouchBarManager
	 */
	replaceItem({ label, tbItem, toReplace }) {
		const item = this.items.find(item => item.label === toReplace);
		if (!item) {
			return;
		}
		this.removeItem(item.label);
		this.addItem({ label, place: item.place, tbItem });
	}

	/**
	 * Set the escape key.
	 *
	 * @param {Object} item - Item to set the escape key to.
	 * @memberof TouchBarManager
	 */
	setEscape(item) {
		this.touchBar.escapeItem = item;
	}

	/**
	 * Show the buttons on the TouchBar.
	 *
	 * @memberof TouchBarManager
	 */
	show() {
		const items = this.items.map(i => i.tbItem);
		this.touchBar = new TouchBar({ items });
		atom.getCurrentWindow().setTouchBar(this.touchBar);
	}
}
