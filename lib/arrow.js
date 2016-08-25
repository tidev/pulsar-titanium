'use babel'

import fs from 'fs';

let APPC_JSON_FILENAME = 'appc.json';
let PACKAGE_JSON_FILENAME = 'package.json';

var Arrow = {
    isArrowProject: false,
    appc: undefined,
    package: undefined,

    load: function(){
        var path = atom.project.getPaths()[0] + '/' + APPC_JSON_FILENAME;
        this.loadAppcFileAt(path);
        path = atom.project.getPaths()[0] + '/' + PACKAGE_JSON_FILENAME;
        this.loadPackageFileAt(path);
    },

    loadAppcFileAt: function(path){
        console.log('Loading appc.json file at ' + path);
        this.isArrowProject = false;
        try {
            var fileData = fs.readFileSync(path, 'ascii');
            var json = JSON.parse(fileData);
            this.isArrowProject = true;
            console.log(json);
            this.appc = json;
        } catch (ex) {
            console.log(ex)
        }
    },

    loadPackageFileAt: function(path){
        console.log('Loading package.json file at ' + path);
        try {
            var fileData = fs.readFileSync(path, 'ascii');
            var json = JSON.parse(fileData);
            console.log(json);
            this.package = json;
        } catch (ex) {
            console.log(ex)
        }
    },

    appName: function() {
        return this.package.name;
    }
}

module.exports = Arrow;
