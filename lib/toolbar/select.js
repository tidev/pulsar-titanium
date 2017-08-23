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

    addOption(args) {
        var option = document.createElement('option');
        option.setAttribute('value', args.value);
        var text = document.createTextNode(args.text);
        option.appendChild(text);
        this.element.appendChild(option);
    }

    addOptions(options) {
        options.forEach(function(option){
            this.addOption(option);
        }.bind(this));
    }

    selectedOption() {
        return this.element.options[this.element.selectedIndex];
    }

    selectFirst() {
      this.element.selectedIndex = 0;
      //this.element.onchange();
    }

    selectLast() {
      this.element.selectedIndex = this.element.options.length - 1;
      //this.element.onchange();
    }

    destroy () {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.element = null;
    }
}
