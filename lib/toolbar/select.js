'use babel';

import {Emitter} from 'atom'

export default class Select {

    constructor(options) {
      this.element = document.createElement('select');
      this.element.classList.add('select', 'element');
      this.element.style.width = options.width;

      this.emitter = new Emitter();
      this.element.onchange = function(e){
          var selectedOption = this.element.options[this.element.selectedIndex];
          this.emitter.emit('change', {text: selectedOption.text, value: selectedOption.value});
      }.bind(this);
    }

    onChange(callback) {
        this.emitter.on('change', callback);
    }

    removeOptions() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
    }

    addOption(options) {

        var option = document.createElement('option');
        option.setAttribute('value', options.value);
        var text = document.createTextNode(options.text);
        option.appendChild(text);
        this.element.appendChild(option);
    }

    selectedOption() {
        return this.element.options[this.element.selectedIndex];
    }

    destroy () {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.element = null;
    }
}
