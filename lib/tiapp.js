'use babel'

import fs from 'fs';
import {File} from 'atom';
import {Emitter} from 'atom';
import xml2js from 'xml2js';

const TIAPP_FILENAME = 'tiapp.xml';
const DEFAULT_ICON_FILENAME = 'DefaultIcon.png'
const EVENT_MODIFIED = 'modified';

var Tiapp = {

    isTitaniumProject: false,
    tiapp: undefined,
    emitter: new Emitter(),

    load: function() {
        this.loadFileAt(atom.project.getPaths()[0] + '/' + TIAPP_FILENAME);
    },

    loadFileAt: function(path) {
        this.isTitaniumProject = false;
        const file = new File(path);
        if (file.existsSync()) {
            const fileData = fs.readFileSync(path, 'ascii');
            const parser = new xml2js.Parser();
            let json;
            parser.parseString(fileData.substring(0, fileData.length), function (err, result) {
                json = result;
            });
            this.tiapp = json['ti:app'];
            this.isTitaniumProject = true;

            if (!this.watcher) {
                this.watcher = atom.project.onDidChangeFiles(events => {
                    for (const event of events) {
                        if (event.path === path && event.action === 'modified') {
                            this.loadFileAt(path);
                            this.emitter.emit(EVENT_MODIFIED);
                        }
                    }
                });
            }
        }
    },

    onModified: function(callback) {
        Tiapp.emitter.on(EVENT_MODIFIED, callback);
    },

    appId: function() {
        return this.tiapp.id;
    },

    appName: function() {
        return this.tiapp.name;
    },

    sdk: function() {
        return this.tiapp['sdk-version'];
    },

    appIcon: function() {
        return atom.project.getPaths()[0] + '/' + DEFAULT_ICON_FILENAME;
    },

    destroy: function() {
        this.emitter.dispose();
        this.watcher.dispose();
    }
};

module.exports = Tiapp;
