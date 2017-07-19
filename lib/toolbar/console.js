'use babel';

export default class Console {// extends View {

    constructor() {
        this.element = document.createElement('div');
        this.element.classList.add('console');

        this.toolbar = document.createElement('div');
        this.toolbar.classList.add('console-toolbar');
        this.element.appendChild(this.toolbar);

        var closeButton = document.createElement('button');
        closeButton.classList.add('console-toolbar-button');
        var title = document.createTextNode("Close");
        closeButton.appendChild(title);
        this.close = this.close.bind(this);
        closeButton.addEventListener('click', this.close);
        this.toolbar.appendChild(closeButton);

        var clearButton = document.createElement('button');
        clearButton.classList.add('console-toolbar-button');
        var title = document.createTextNode("Clear");
        clearButton.appendChild(title);
        this.clear = this.clear.bind(this);
        clearButton.addEventListener('click', this.clear);
        this.toolbar.appendChild(clearButton);

        this.messages = document.createElement('div');
        this.messages.classList.add('console-messages');
        this.element.appendChild(this.messages);

        this.show();
    }

    getTitle() {
        return 'Console';
    }

    show() {
        this.pane = atom.workspace.paneForItem(this);
        if (!this.pane) {
            atom.workspace.getActivePane().splitDown();
            atom.workspace.getActivePane().addItem(this);
            this.messages.scrollTop = this.messages.scrollHeight;
        }
    }

    hide() {
        this.pane = atom.workspace.paneForItem(this);
        if (this.pane) {
            this.pane.destroyItem(this);
        }
    }

    write(text) {
        text = text = text.replace(/(?:\r\n|\r|\n)/g, '<br />');
        lines = text.split('<br />');

        for (var i=0, numLines=lines.length; i<numLines; i++) {
            var text = lines[i];
            if (text.length === 0) continue;
            var p = document.createElement('p');
            p.classList.add('log');
            if (text.indexOf('[TRACE]') == 0 || text.indexOf('TRACE') == 0) {
                p.classList.add('trace');
            } else if (text.indexOf('[INFO]') == 0 || text.indexOf('INFO') == 0) {
                p.classList.add('info');
            } else if (text.indexOf('[DEBUG]') == 0 || text.indexOf('DEBUG') == 0) {
                p.classList.add('debug');
            } else if (text.indexOf('[WARN]') == 0 || text.indexOf('WARN') == 0) {
                p.classList.add('warn');
            } else if (text.indexOf('[ERROR]') == 0 || text.indexOf('ERROR') == 0) {
                p.classList.add('error');
            }
            var textNode = document.createTextNode(text);
            p.appendChild(textNode);
            this.messages.appendChild(p);
            this.messages.scrollTop = this.messages.scrollHeight;
        }
    }

    close() {
        this.hide();
    }

    clear() {
        while(this.messages.firstChild) {
            this.messages.removeChild(this.messages.firstChild);
        }
    }

    // error(text) {
    //     var p = document.createElement('p');
    //     p.classList.add('error');
    //     var textNode = document.createTextNode(text);
    //     p.appendChild(textNode);
    //     this.element.appendChild(p);
    //     this.element.scrollTop = this.element.scrollHeight;
    // }
}
