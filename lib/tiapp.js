'use babel'

import fs from 'fs';
import {File} from 'atom';
import xml2js from 'xml2js';

const TIAPP_FILENAME = 'tiapp.xml';
const DEFAULT_ICON_FILENAME = 'DefaultIcon.png'

var Tiapp = {

    isTitaniumProject: false,
    tiapp: undefined,

    load: function(){
        var path = atom.project.getPaths()[0] + '/' + TIAPP_FILENAME;
        this.loadFileAt(path);
    },

    loadFileAt: function(path){
        // console.log('Loading Tiapp.xml file at ' + path);
        this.isTitaniumProject = false;
        var file = new File(path);
        if (file.existsSync()) {
            var fileData = fs.readFileSync(path, 'ascii');
            var parser = new xml2js.Parser();
            var json;
            parser.parseString(fileData.substring(0, fileData.length), function (err, result) {
                json = result;
            });
            this.tiapp = json["ti:app"];
            this.isTitaniumProject = true;
        }
    },

    appName: function(){
        return this.tiapp.name;
    },

    sdk: function(){
        return this.tiapp["sdk-version"];
    },

    appIcon: function(){
        return atom.project.getPaths()[0] + '/' + DEFAULT_ICON_FILENAME;
    }

};

module.exports = Tiapp;
