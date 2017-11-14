/** @babel */
/** @jsx etch.dom */

import { CompositeDisposable } from 'atom';
import etch from 'etch';
import Button from './button';
import Select from './select';

/**
 * 
 */
class ConsoleLog {
  
	constructor(opts) {
		this.children = [];
		this.autoScroll = opts.autoScroll;
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

	update(opts, children) {
		if (opts) {
			this.autoScroll = opts.autoScroll;
		}
		return etch.update(this);
	}

	readAfterUpdate() {
		if (this.autoScroll) {
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

	constructor(state) {
		this.state = {
			isHidden: true,
			logLevel: 'trace',
			autoScroll: true,
			showOnBuild: true
		};
		state && Object.assign(this.state, state);

		etch.initialize(this);
		
		if (!this.state.isHidden) {
			this.show();
		}

		const bottomDock = atom.workspace.getBottomDock(),
			  rightDock = atom.workspace.getRightDock();
		this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(
			bottomDock.onDidChangeVisible((visible) => {
				for (const item of bottomDock.getPaneItems()) {
					if (item === this) this.state.isHidden = !visible;
				}
			}),
			rightDock.onDidChangeVisible((visible) => {
				for (const item of rightDock.getPaneItems()) {
					if (item === this) this.state.isHidden = !visible;
				}
			}),
			atom.workspace.onDidAddPaneItem((e) => {
				if (e.item === this) this.state.isHidden = false;
			}),
			atom.workspace.onDidDestroyPaneItem((e) => {
				if (e.item === this) this.state.isHidden = true;
			})
		);
	}

	async destroy() {
		this.subscriptions.dispose();
		await etch.destroy(this);
	}

	getTitle() {
		return 'Appcelerator Console';
	}

	getURI() {
		return 'atom://appcelerator-titanium/console';
	}

	getDefaultLocation() {
		return 'bottom';
	}

	getAllowedLocations() {
		return ['right', 'bottom'];
	}

	serializedState() {
		return this.state;
	}

	update(props, children) {
		return etch.update(this);
	}

	render() {
		return (
			<div className='appc-console'>
				<div className='appc-toolbar'>
					<div class='toolbar-row'>
						<div className='toolbar-left'>
							<Select change={this.logLevelValueDidChange.bind(this)} value={this.state.logLevel}>
								<option value='trace'>Trace</option>
								<option value='debug'>Debug</option>
								<option value='info'>Info</option>
								<option value='warn'>Warn</option>
								<option value='error'>Error</option>
							</Select>
							<div className='toolbar-item-title'>
								<label class='input-label'><input class='input-checkbox' type='checkbox' attributes={this.state.autoScroll ? {'checked':'true'} : {}} on={{change:this.autoScrollCheckboxDidChange}} />Auto-scroll</label>
							</div>
							<div className='toolbar-item-title'>
								<label class='input-label'><input class='input-checkbox' type='checkbox' attributes={this.state.showOnBuild ? {'checked':'true'} : {}} on={{change:this.showOnBuildCheckboxDidChange}} />Show on build</label>
							</div>
						</div>
						<div className='toolbar-right'>
							<Button flat='true' icon='trashcan' className='button-right' click={this.clear.bind(this)} />
						</div>
					</div>
				</div>
				<ConsoleLog ref='log' autoScroll={this.state.autoScroll} />
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

	toggle() {
		this.state.isHidden = this.hide();
		if (!this.state.isHidden) {
			this.show();
		}
	}

	show(buildInProgress) {
		if (buildInProgress && !this.state.showOnBuild) return;
		atom.workspace.open(this);
	}

	hide() {
		return atom.workspace.hide(this);
	}

	getLogLevel() {
		return this.state.logLevel;
	}

	logLevelValueDidChange(event) {
		this.state.logLevel = event.target.selectedOptions[0].value;
	}

	clear() {
		this.refs.log.clear();
	}

	autoScrollCheckboxDidChange(event) {
		this.state.autoScroll = event.target.checked;
		etch.update(this);
	}

	showOnBuildCheckboxDidChange(event) {
		this.state.showOnBuild = event.target.checked;
		etch.update(this);
	}
}