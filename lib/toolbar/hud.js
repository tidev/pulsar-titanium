'use babel';

const FLASH_DURATION = 3000;

export default class Hud {

    constructor (options) {
        this.element = document.createElement('div');
        this.element.classList.add('hud');
        this.element.classList.add('element');

        this.icon = document.createElement('img');
        this.icon.classList.add('hud-icon');
        this.icon.src = __dirname + '/../../images/appc.png';
        this.element.appendChild(this.icon);

        this.message = document.createElement('p');
        this.message.classList.add('hud-message');
        this.element.appendChild(this.message);

        this.spinner = document.createElement('img');
        this.spinner.classList.add('hud-spinner');
        this.spinner.src = __dirname + '/../../images/spinner.gif';
        this.element.appendChild(this.spinner);

        this.default = {
            text: 'Ready. Open a Titanium or Arrow project.'
        };

        this.displayDefault();

        // this.displayMessage({
        //     text: 'This is a flaaaaaaash!',
        //     flash: true
        // });
    }

    displayMessage(options) {
        if (options.icon) {
          this.icon.src = options.icon;
        }

        if (options.text) {
          while (this.message.firstChild) {
              this.message.removeChild(this.message.firstChild);
          }
          var text = document.createTextNode(options.text);
          this.message.appendChild(text);
        }

        if (options.spinner) {
          this.spinner.style.display = 'block';
        } else {
          this.spinner.style.display = 'none';
        }

        if (options.flash) {
            setTimeout(this.displayDefault.bind(this), FLASH_DURATION);
        } else if (options.default) {
            this.default = options;
        }
    }

    displayDefault() {
        this.displayMessage(this.default);
    }

    destroy () {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}
