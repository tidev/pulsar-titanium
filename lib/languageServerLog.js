'use babel';
/* eslint-env browser */

export const LOG_URI = 'atom://titanium/language-server-log';

/** How many lines are kept. The oldest are dropped first. */
const MAX_LINES = 5000;

/**
 * What the language server and its client have said: the server's `window/logMessage`
 * notifications, its stderr, and when it started and stopped.
 *
 * Kept from activation whether or not the log is open, so it can be opened after the problem it
 * explains has happened.
 */
export default class LanguageServerLog {

	constructor() {
		this.lines = [];
		this.views = new Set();
	}

	/**
	 * @param {String} level - error, warn, info, log or stderr
	 * @param {String} message - What was said; several lines become several entries
	 */
	append(level, message) {
		const time = new Date().toTimeString().slice(0, 8);
		const entries = String(message).replace(/\s+$/, '').split('\n')
			.map(line => `${time} ${level.padEnd(6)} ${line}`);
		this.lines.push(...entries);
		if (this.lines.length > MAX_LINES) {
			this.lines.splice(0, this.lines.length - MAX_LINES);
		}
		for (const view of this.views) {
			view.append(entries);
		}
	}

	clear() {
		this.lines = [];
		for (const view of this.views) {
			view.reset();
		}
	}

	text() {
		return this.lines.join('\n');
	}

	/**
	 * A console in the shape the language client's logging adapter writes to
	 *
	 * @returns {Object}
	 */
	console() {
		return {
			error: message => this.append('error', message),
			warn: message => this.append('warn', message),
			info: message => this.append('info', message),
			log: message => this.append('log', message)
		};
	}

	/**
	 * @returns {Disposable} The opener that shows this log for LOG_URI
	 */
	registerOpener() {
		return atom.workspace.addOpener(uri => (uri === LOG_URI ? new LanguageServerLogView(this) : undefined));
	}

	show() {
		return atom.workspace.open(LOG_URI, { searchAllPanes: true });
	}
}

/**
 * The log, in a dock at the bottom of the window. Plain selectable text, with buttons to copy and
 * clear it, and it follows new lines while scrolled to the end.
 */
class LanguageServerLogView {

	constructor(log) {
		this.log = log;

		this.element = document.createElement('div');
		this.element.classList.add('titanium-language-server-log', 'native-key-bindings');
		this.element.tabIndex = -1;

		const toolbar = document.createElement('div');
		toolbar.classList.add('btn-toolbar');
		toolbar.append(
			this.button('Copy', 'clippy', () => atom.clipboard.write(this.log.text())),
			this.button('Clear', 'trashcan', () => this.log.clear())
		);

		this.output = document.createElement('pre');
		this.element.append(toolbar, this.output);

		this.reset();
		log.views.add(this);
	}

	button(text, icon, onClick) {
		const button = document.createElement('button');
		button.classList.add('btn', 'btn-sm', 'icon', `icon-${icon}`);
		button.textContent = text;
		button.addEventListener('click', onClick);
		return button;
	}

	reset() {
		this.output.textContent = this.log.lines.length ? `${this.log.text()}\n` : '';
		this.output.scrollTop = this.output.scrollHeight;
	}

	append(entries) {
		const following = this.output.scrollTop + this.output.clientHeight >= this.output.scrollHeight - 4;
		this.output.append(`${entries.join('\n')}\n`);
		if (following) {
			this.output.scrollTop = this.output.scrollHeight;
		}
	}

	getTitle() {
		return 'Titanium Language Server';
	}

	getIconName() {
		return 'terminal';
	}

	getURI() {
		return LOG_URI;
	}

	getDefaultLocation() {
		return 'bottom';
	}

	destroy() {
		this.log.views.delete(this);
		this.element.remove();
	}
}
