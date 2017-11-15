/** @babel */
/** @jsx etch.dom */

import etch from 'etch';
import Button from './button';
import Select from './select';

export default class GenerateDialog {

    constructor(opts) {
        this.opts = opts;
        this.type = 'controller';
        etch.initialize(this);
    }

    async destroy() {
		await etch.destroy(this);
    }
    
    update(props, children) {
		return etch.update(this);
    }
    
    readAfterUpdate() {
        this.enableGenerate();
    }

	render() {

        let arguments = <div />;
        if (this.type === 'controller' || this.type === 'view' || this.type === 'style' || this.type === 'widget') {
            arguments = (
                <div className='row'>
                    <div className='title input-title'>Name:</div>
                    <input className='input-text native-key-bindings input' ref='name' on={{input:this.textInputDidChange}} />
                </div>
            )
        } else if (this.type === 'model') {
            arguments = [
                <div className='row'>
                    <div className='title input-title'>Name:</div>
                    <input className='input-text native-key-bindings input' ref='name' on={{input:this.textInputDidChange}} />
                </div>,
                <div className='row'>
                    <div className='title input-title'>Type:</div>
                    <input className='input-text native-key-bindings input' ref='modelType' placeholder='sql | properties' on={{input:this.textInputDidChange}} />
                </div>,
                <div className='row'>
                    <div className='title input-title'>Columns:</div>
                    <input className='input-text native-key-bindings input' ref='modelColumns' placeholder='name:type, name:type, ...' on={{input:this.textInputDidChange}} />
                </div>
            ]
        }

		return (
			<div className='appc-generate-dialog'>
                <div className='row'>
                    <div className='title'>Type:</div>
                    <div className='types'>
                        <div ref='typeController' on={{click:this.controllerClick}} className={this.classNameForType('controller', 'icon icon-code')}>Controller</div>
                        <div ref='typeView' on={{click:this.controllerClick}} className={this.classNameForType('view', 'icon icon-eye')}>View</div>
                        <div ref='typeStyle' on={{click:this.controllerClick}} className={this.classNameForType('style','icon icon-pencil')}>Style</div>
                        <div ref='typeModel' on={{click:this.controllerClick}} className={this.classNameForType('model', 'icon icon-puzzle')}>Model</div>
                        <div ref='typeWidget' on={{click:this.controllerClick}} className={this.classNameForType('widget', 'icon icon-file-submodule')}>Widget</div>
                        <div ref='typeJmk' on={{click:this.controllerClick}} className={this.classNameForType('jmk', 'icon icon-file-code')}>JMK</div>
                    </div>
                </div>
                {arguments}
                <div className='row-buttons'>
                    <button class='btn' on={{click:this.cancelButtonClick}}>Cancel</button>
                    <button class='btn btn-primary inline-block-tight' disabled={!this.generateButtonEnabled} on={{click:this.generateButtonClick}}>Generate</button>
                </div>
            </div>
        )
    }

    classNameForType(type, className) {
        if (this.type === type) return `${className} selected`;
        return className;
    }

    textInputDidChange() {
        this.enableGenerate();
    }

    enableGenerate() {
        let enabled;
        if (this.type === 'controller' || this.type === 'view' || this.type === 'style' || this.type === 'widget') {
            enabled = (this.refs.name.value.length > 0);
        } else if (this.type === 'model') {
            enabled = (this.refs.name.value.length > 0 && this.refs.modelType.value.length > 0 && this.refs.modelColumns.value.length > 0);
        } else if (this.type === 'jmk') {
            enabled = true;
        }

        if (this.generateButtonEnabled != enabled) {
            this.generateButtonEnabled = enabled;
            etch.update(this);
        }
    }

    cancelButtonClick() {
        this.opts.cancel && this.opts.cancel();
    }

    generateButtonClick() {
        let arguments = [];
        if (this.type === 'controller' || this.type === 'view' || this.type === 'style' || this.type === 'widget') {
            arguments = [this.refs.name.value];
        } else if (this.type === 'model') {
            arguments = [this.refs.name.value, this.refs.modelType.value, this.refs.modelColumns.value];
        }
        this.opts.generate && this.opts.generate(this.type, arguments);
    }

    controllerClick(event) {
        switch (event.target) {
            case this.refs.typeController:
                this.type = 'controller';
                break;
            case this.refs.typeView:
                this.type = 'view';
                break;
            case this.refs.typeStyle:
                this.type = 'style';
                break;
            case this.refs.typeModel:
                this.type = 'model';
                break;
            case this.refs.typeWidget:
                this.type = 'widget';
                break;
            case this.refs.typeJmk:
                this.type = 'jmk';
                break;
            default:
                break;
        }
        
        etch.update(this);
    }
}