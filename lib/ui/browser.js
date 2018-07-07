'use babel';
/** @jsx etch.dom */

import etch from 'etch';

import { CompositeDisposable } from 'atom';

export default class Browser {

	constructor() {
		this.state = {
			url: ''
		};

		etch.initialize(this);
	}

	async destroy() {
		await etch.destroy(this);
	}

	render() {
		return <div id="appc-browser" className="appc-browser native-key-bindings" on={{ contextmenu: this.onContextMenu }}>
			<div className="webview-container">
				<webview src={this.state.url} tabindex="0" on={{ 'dom-ready': this.onReady }}/>
			</div>
		</div>;
	}

	onContextMenu(e) {
		e.preventDefault();
		e.cancelBubble = true;
		return false;
	}

	onReady(e) {
		e.target.focus();
	}

	update() {
		return etch.update(this);
	}

	getTitle() {
		return 'debugger';
	}

	show() {
		atom.workspace.open(this, {
			activatePane: true,
			activateItem: true,
			searchAllPanes: true
		});
	}

	setUrl(url) {
		this.state.url = url;
		this.update();
	}
}
