/** @babel */
/** @jsx etch.dom */

import etch from 'etch';
import Button from './button';
import Select from './select';

/**
 * 
 */
class ConsoleLog {
  
	constructor() {
    	this.children = [];
    	etch.initialize(this);
  	}
  
  	render() {
    	return <div className='console-messages native-key-bindings' ref='log' attributes={{tabindex:'-1'}}>
      		{this.children}
    	</div>;
  	}
  
	write(text, level) {
		this.children.push(<p className={`log ${level}`}>{text}</p>);
		this.update();
	}

	update(props, children) {
		return etch.update(this);
	}

	readAfterUpdate() {
		if (atom.config.get('appc:consoleAutoScroll')) {
			this.refs.log.scrollTop = this.refs.log.scrollHeight;
		}
	}

	async destroy() {
		await etch.destroy(this);
	}

	clear() {
		this.children = [];
		this.update();
	}
}


/**
 * 
 */
export default class Console {

	constructor() {
		this.logLevel = 'trace';
		etch.initialize(this);
		//TODO: remember last state, support show-on-build
		this.show();
	}

	render() {
		return (
			<div className='appc-console'>
				<div className='appc-toolbar'>
					<div class='toolbar-row'>
						<div className='toolbar-left'>
							<Select change={this.logLevelValueDidChange.bind(this)}>
								<option value='trace'>Trace</option>
								<option value='debug'>Debug</option>
								<option value='info'>Info</option>
								<option value='warn'>Warn</option>
								<option value='error'>Error</option>
							</Select>
							<div className='toolbar-item-title'>
								<label class='input-label'><input class='input-checkbox' type='checkbox' attributes={atom.config.get('appc:consoleAutoScroll') ? {'checked':'true'} : {}} on={{change:this.autoScrollCheckboxDidChange}} />Auto-scroll</label>
							</div>
						</div>

						<div className='toolbar-right'>
							<Button flat='true' icon='trashcan' className='button-right' click={this.clearButtonClick.bind(this)} />
						</div>
					</div>
				</div>
				<ConsoleLog ref='log' />
			</div>
		)
	}

	write(text) {
		text = text = text.replace(/(?:\r\n|\r|\n)/g, '<br />');
		lines = text.split('<br />');

		for (var i=0, numLines=lines.length; i<numLines; i++) {
			var text = lines[i];
			if (text.length === 0) continue;
			if (text.indexOf('[TRACE]') === 0 || text.indexOf('TRACE') != -1) {
				this.trace(text);
			// } else if (text.indexOf('[INFO]') === 0 || text.indexOf('INFO') === 0) {
			// 	this.info(text);
			} else if (text.indexOf('[DEBUG]') === 0 || text.indexOf('DEBUG') != -1) {
				this.debug(text);
			} else if (text.indexOf('[WARN]') === 0 || text.indexOf('WARN') != -1) {
				this.warn(text);
			} else if (text.indexOf('[ERROR]') === 0 || text.indexOf('ERROR') != -1) {
				this.error(text);
			} else {
				this.info(text);
			}
		}
	}

	trace(text) {
		this.refs.log.write(text, 'trace');
	}

	info(text) {
		this.refs.log.write(text, 'info');
	}

	debug(text) {
		this.refs.log.write(text, 'debug');
	}

	warn(text) {
		this.refs.log.write(text, 'warn');
	}

	error(text) {
		this.refs.log.write(text, 'error');
	}

	update(props, children) {
		return etch.update(this);
	}

	async destroy() {
		await etch.destroy(this);
	}

	getTitle() {
		return 'Console';
	}

	get isShowing() {
		return atom.workspace.paneForItem(this);
	}

	show() {
		this.pane = atom.workspace.paneForItem(this);
		if (!this.pane) {
			atom.workspace.getActivePane().splitDown({items: [this]});
		}
	}

	hide() {
		this.pane = atom.workspace.paneForItem(this);
		if (this.pane) {
			this.pane.destroyItem(this);
		}
	}

	getLogLevel() {
		return this.logLevel;
	}

	logLevelValueDidChange(event) {
		this.logLevel = event.target.selectedOptions[0].value;
	}

	close() {
		this.hide();
	}

	clearButtonClick() {
		this.clear();
	}

	clear() {
		this.refs.log.clear();
	}

	autoScrollCheckboxDidChange(event) {
		atom.config.set('appc:consoleAutoScroll', event.target.checked);
		etch.update(this);
	}
}