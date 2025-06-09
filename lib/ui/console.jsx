/** @babel */
/** @jsx etch.dom */

import { CompositeDisposable } from 'atom';
import { platform } from 'os';
import etch from 'etch';
import Button from './button.jsx';
import Select from './select.jsx';

/**
 * ConsoleLog
 */
class ConsoleLog {

	/**
	 * Constructor
	 *
	 * @param {Object} 	opts 				arguments
	 * @param {Boolean}	opts.autoScroll		auto-scroll enabled
	 */
	constructor(opts) {
		this.children = [];
		this.autoScroll = opts.autoScroll;
		this.HighlightText = '';
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
		return (
			<div className="console-messages native-key-bindings" ref="log" attributes={{ tabindex: '-1' }}>
				{this.children}
			</div>
		);
	}

	/**
	 * Set highlighted text string
	 *
	 * @param {String} text		Text that will be highlighted
	 */
	setHighlightText(text) {
		this.highlightText = text;
	}

	/**
	 * Highlight text in console from highlightText string
	 */
	highlightTextInLog() {
		let origInnerHtml = this.refs.log.innerHTML;
		let cleanInnerHtml = origInnerHtml.replace(/<span class="highlight">(.*?)<\/span>/gi, '$1');
		if (this.highlightText) {
			const escapedText = this.highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const regex = new RegExp(escapedText, 'gi');
			this.refs.log.innerHTML = cleanInnerHtml.replace(regex, match => `<span class="highlight">${match}</span>`);
		} else {
			this.refs.log.innerHTML = cleanInnerHtml;
		}
	}

	/**
	 * Jump to next highlighted text string
	 *
	 * @param {String} direction	Direction to jump (up/down)
	 */
	jumpToHighlightedText(direction) {
		const log = this.refs.log;
		const textElements = log.querySelectorAll('.highlight');
		const scrollTop = log.scrollTop;
		const containerHeight = log.offsetHeight;
		const centerLine = scrollTop + containerHeight / 2;

		let bestAbove = null;
		let bestBelow = null;

		for (const el of textElements) {
			const elTop = el.offsetTop;
			const centeredOffset = elTop - containerHeight / 2;

			if (elTop < centerLine) {
				bestAbove = centeredOffset;
			} else if (elTop > centerLine && bestBelow === null) {
				bestBelow = centeredOffset;
			}
		}

		if (direction === 'down') {
			if (bestBelow === null) {
				return;
			}
			log.scrollTop = Math.min(bestBelow, log.scrollHeight - containerHeight);
		} else {
			if (bestAbove === null) {
				return;
			}
			log.scrollTop = Math.max(bestAbove, 0);
		}
	}

	/**
	 * Update component
	 *
	 * @param {Object} opts 	state
	 * @returns {Promise}
	 */
	update(opts) {
		if (opts) {
			this.autoScroll = opts.autoScroll;
		}
		return etch.update(this);
	}

	/**
	 * Query DOM after update
	 */
	readAfterUpdate() {
		if (this.autoScroll) {
			this.refs.log.scrollTop = this.refs.log.scrollHeight;
		}
	}

	/**
	 * Write text to console
	 *
	 * @param {String} text 	text to display
	 * @param {String} level 	level style
	 */
	write(text, level) {
		this.children.push(<p className={`log ${level}`}>{text}</p>);
		this.update();
	}

	/**
	 * Clear console
	 */
	clear() {
		this.children = [];
		this.refs.log.innerHTML = '';
		this.update();
	}
}

/**
 * Console
 */
export default class Console {

	/**
	 * Constructor
	 *
	 * @param {Object} 	opts 			arguments
	 * @param {Boolean} isHidden		is hidden
	 * @param {String} 	logLevel		selected log level
	 * @param {Boolean} autoScroll		auto-scroll console window
	 * @param {Boolean} showOnBuild		display console when running build command
	 */
	constructor(opts) {
		this.state = {
			isHidden: true,
			logLevel: 'info',
			autoScroll: true,
			showOnBuild: true,
			consoleHighlightText: ''
		};
		opts && Object.assign(this.state, opts);

		etch.initialize(this);

		if (!this.state.isHidden) {
			this.show();
		}

		this.subscriptions = new CompositeDisposable();
		this.subscriptions.add(
			atom.workspace.onDidOpen(e => {
				if (e.item === this) {
					this.state.isHidden = true;
				}
			})
		);
	}

	/**
	 * Clean up
	 */
	async destroy() {
		this.subscriptions.dispose();
		const pane = atom.workspace.paneForItem(this);
		if (pane) {
			pane.destroyItem(this);
		}
		await etch.destroy(this);
	}

	/**
	 * Current state virtual DOM element
	 *
	 * @returns {Object}
	 */
	render() {
		return (
			<div className="appc-console">
				<div className="appc-toolbar">
					<div className="toolbar-row">
						<div className="toolbar-left">
							<Select change={this.logLevelValueDidChange.bind(this)} value={this.state.logLevel}>
								<option value="info">Info</option>
								<option value="trace">Trace</option>
								<option value="debug">Debug</option>
								<option value="warn">Warn</option>
								<option value="error">Error</option>
							</Select>
							<div className="toolbar-item-title">
								<label className="input-label"><input className="input-checkbox" type="checkbox" attributes={this.state.autoScroll ? { checked: 'true' } : {}} on={{ change: this.autoScrollCheckboxDidChange }} />Auto-scroll</label>
							</div>
							<div className="toolbar-item-title">
								<label className="input-label"><input className="input-checkbox" type="checkbox" attributes={this.state.showOnBuild ? { checked: 'true' } : {}} on={{ change: this.showOnBuildCheckboxDidChange }} />Show on build</label>
							</div>
							<div className="toolbar-item-title">
								<label className="input-label">Find:</label>
							</div>
							<div>
								<input
									type="text"
									className="input-text native-key-bindings input"
									value={this.state.consoleHighlightText}
									on={{ input: this.consoleHighlightTextDidChange }}
								/>
							</div>
							<div>
								<Button icon="arrow-up" title="Find Previous" className="button-right console-search-button" flat="true" click={this.findText.bind(this, 'up')} />
								<Button icon="arrow-down" title="Find Next" className="button-right console-search-button" flat="true" click={this.findText.bind(this, 'down')} />
							</div>
						</div>
						<div className="toolbar-right">
							<Button flat="true" icon="trashcan" className="button-right" click={this.clear.bind(this)} />
						</div>
					</div>
				</div>
				<ConsoleLog ref="log" autoScroll={this.state.autoScroll} />
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
	 * Atom item title
	 *
	 * @returns {String}
	 */
	getTitle() {
		return 'Titanium SDK console';
	}

	/**
	 * Atom item URL
	 *
	 * @returns {String}
	 */
	getURI() {
		return 'atom://titanium/console';
	}

	/**
	 * Atom dock default location
	 *
	 * @returns {String}
	 */
	getDefaultLocation() {
		return 'bottom';
	}

	/**
	 * Serialized state object
	 *
	 * @returns {Object}
	 */
	serializedState() {
		return this.state;
	}

	/**
	 * Write text string to console
	 *
	 * @param {String} text 	text string
	 */
	write(text) {
		text = text.replace(/(?:\r\n|\r|\n)/g, '<br />');
		if (platform() === 'win32') {
			text = text.replace(/\u0008/g, '');
		}
		const lines = text.split('<br />');

		for (let line of lines) {
			line = line.replace(/^\[(\w+)] :/, '[$1]');
			if (line.length === 0) {
				continue;
			}

			if (line.indexOf('[TRACE]') === 0 || line.indexOf('TRACE') !== -1) {
				this.trace(line);
			} else if (line.indexOf('[DEBUG]') === 0 || line.indexOf('DEBUG') !== -1) {
				this.debug(line);
			} else if (line.indexOf('[WARN]') === 0 || line.indexOf('WARN') !== -1) {
				this.warn(line);
			} else if (line.indexOf('[ERROR]') === 0 || line.indexOf('ERROR') !== -1) {
				this.error(line);
			} else {
				this.info(line);
			}
		}
	}

	/**
	 * Write trace log message
	 *
	 * @param {String} text 	text string
	 */
	trace(text) {
		this.refs.log.write(text, 'trace');
	}

	/**
	 * Write info log message
	 *
	 * @param {String} text 	text string
	 */
	info(text) {
		this.refs.log.write(text, 'info');
	}

	/**
	 * Write debug log message
	 *
	 * @param {String} text 	text string
	 */
	debug(text) {
		this.refs.log.write(text, 'debug');
	}

	/**
	 * Write warn log message
	 *
	 * @param {String} text 	text string
	 */
	warn(text) {
		this.refs.log.write(text, 'warn');
	}

	/**
	 * Write error log message
	 *
	 * @param {String} text 	text string
	 */
	error(text) {
		this.refs.log.write(text, 'error');
	}

	/**
	 * Show / hide console
	 */
	toggle() {
		this.state.isHidden = this.hide();
		if (!this.state.isHidden) {
			this.show();
		}
	}

	/**
	 * Show console
	 *
	 * @param {Boolean} buildInProgress 	true if build is in progress
	 */
	show(buildInProgress) {
		if (buildInProgress && !this.state.showOnBuild) {
			return;
		}
		atom.workspace.open(this);
	}

	/**
	 * Hide console
	 *
	 * @returns {Boolean}
	 */
	hide() {
		return atom.workspace.hide(this);
	}

	/**
	 * Selected log level
	 *
	 * @returns {String}
	 */
	getLogLevel() {
		return this.state.logLevel;
	}

	/**
	 * Clear console
	 */
	clear() {
		this.refs.log.clear();
	}

	/**
	 * Jump to text
	 *
	 * @param {String} direction	Direction to look for text
	 */
	findText(direction) {
		if (this.state.consoleHighlightText) {
			this.refs.log.setHighlightText(this.state.consoleHighlightText);
			this.refs.log.highlightTextInLog();
			this.refs.log.jumpToHighlightedText(direction);
		}
	}

	/**
	 * Console filter value changed
	 *
	 * @param {Object} event 	change event object
	 */
	consoleHighlightTextDidChange(event) {
		this.state.consoleHighlightText = event.target.value;
	}

	/**
	 * Log level value changed
	 *
	 * @param {Object} event 	change event object
	 */
	logLevelValueDidChange(event) {
		this.state.logLevel = event.target.selectedOptions[0].value;
	}

	/**
	 * Auto-scroll changed
	 *
	 * @param {Object} event 	change event object
	 */
	autoScrollCheckboxDidChange(event) {
		this.state.autoScroll = event.target.checked;
		etch.update(this);
	}

	/**
	 * Show on build changed
	 *
	 * @param {Object} event 	change event object
	 */
	showOnBuildCheckboxDidChange(event) {
		this.state.showOnBuild = event.target.checked;
		etch.update(this);
	}
}
