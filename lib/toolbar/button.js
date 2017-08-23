'use babel';

import {CompositeDisposable} from 'atom';

let prevFocusedElm = null;

export default class Button {

    constructor (options) {
        this.element = document.createElement('button');
        this.subscriptions = new CompositeDisposable();
        this.options = options;

        if (options.tooltip) {
            this.element.title = options.tooltip;
            this.subscriptions.add(
                atom.tooltips.add(this.element, {
                    title: options.tooltip,
                    placement: 'bottom'
                })
            );
        }

        this.element.classList.add('button', `${options.class}`, 'element', 'fa', 'fa-lg', `fa-${options.icon}`);

        this._onClick = this._onClick.bind(this);
        this.element.addEventListener('click', this._onClick);
    }

    setEnabled (enabled) {
        if (enabled) {
            this.element.classList.remove('disabled');
        } else {
            this.element.classList.add('disabled');
        }
    }

    destroy () {
        this.subscriptions.dispose();
        this.subscriptions = null;

        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        this.element.removeEventListener('click', this._onClick);
        this.element.removeEventListener('mouseover', this._onMouseOver);
        this.element = null;
    }

    _onClick (e) {
        if (!this.element.classList.contains('disabled')) {
            executeCallback(this.options, e);
        }
        e.preventDefault();
        e.stopPropagation();
    }
}

function getPrevFocusedElm () {
    const workspaceView = atom.views.getView(atom.workspace);
    if (workspaceView.contains(prevFocusedElm)) {
        return prevFocusedElm;
    } else {
        return workspaceView;
    }
}

function executeCallback ({callback, data}, e) {
    console.log('appc.toolbar-button.executeCallback: ' + JSON.stringify(callback));
    if (typeof callback === 'object' && callback) {
        callback = getCallbackModifier(callback, e);
    }
    if (typeof callback === 'string') {
        atom.commands.dispatch(getPrevFocusedElm(), callback);
    } else if (typeof callback === 'function') {
        callback(data, getPrevFocusedElm());
    }
}

function getCallbackModifier (callback, {altKey, ctrlKey, shiftKey}) {
    if (!(ctrlKey || altKey || shiftKey)) {
        return callback[''];
    }
    const modifier = Object.keys(callback)
        .filter(Boolean)
        .map(modifiers => modifiers.toLowerCase())
        .reverse()
        .find(item => {
            if ((~item.indexOf('alt') && !altKey) || (altKey && !~item.indexOf('alt'))) {
                return false;
            }
            if ((~item.indexOf('ctrl') && !ctrlKey) || (ctrlKey && !~item.indexOf('ctrl'))) {
                return false;
            }
            if ((~item.indexOf('shift') && !shiftKey) || (shiftKey && !~item.indexOf('shift'))) {
                return false;
            }
            return true;
        });
    return callback[modifier] || callback[''];
}
