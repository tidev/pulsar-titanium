'use babel'

import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';
import {File} from 'atom';
import {Emitter} from 'atom';

const TIAPP_FILENAME = 'tiapp.xml';
const EVENT_MODIFIED = 'modified';

var Tiapp = {

    isTitaniumProject: false,
    tiapp: undefined,
    emitter: new Emitter(),

    load: function() {
        this.loadFileAt(atom.project.getPaths()[0] + '/' + TIAPP_FILENAME);
    },

    loadFileAt: function(filePath) {
        this.isTitaniumProject = false;
        const file = new File(filePath);
        if (file.existsSync()) {
            const fileData = fs.readFileSync(filePath, 'utf-8');
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
                        if (event.filePath === filePath && event.action === 'modified') {
                            this.loadFileAt(filePath);
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
        const files = ['app/DefaultIcon.png', 'app/DefaultIcon-ios.png', 'DefaultIcon.png', 'DefaultIcon-ios.png'];
        for (const file of files) {
            filePath = path.join(atom.project.getPaths()[0], file);
            if (fs.existsSync(filePath)) return filePath;
        }
    },

    destroy: function() {
        this.emitter.dispose();
        this.watcher.dispose();
    }
};

module.exports = Tiapp;
