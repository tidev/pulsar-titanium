'use babel'

import fs from 'fs';
import path from 'path';
import _ from 'underscore';

var hiddenEditor;

export default {
 
    /**
     * iOS provisioning profile matches App ID
     * 
     * @param {String} profileAppId 
     * @param {String} appId 
     * @return {Boolean}
     */
    iOSProvisioinngProfileMatchesAppId(profileAppId, appId) {

        // allow wildcard
        if (profileAppId === '*') return true;

        // allow explicit match
        if (profileAppId === appId) return true;

        // limited wildcard
        if (profileAppId.indexOf('*') == profileAppId.length-1) {
            const profileAppIdPrefix = profileAppId.substr(0, profileAppId.length-1);
            if (appId.indexOf(profileAppIdPrefix) == 0) return true;
        }

        return false;
    },



    /**************************************************************************/


    getFileEditor(path){
        var targetEditor = _.find(atom.workspace.getTextEditors(), (editor) => {
            return editor.getPath() === path;
        });
    
        // if targetFile not opened or tokenized yet, use new buffer
        if(!targetEditor || (targetEditor && !targetEditor.tokenizedBuffer.fullyTokenized)){
            hiddenEditor = hiddenEditor ||  atom.workspace.buildTextEditor();  //https://discuss.atom.io/t/best-way-to-create-new-texteditor/18995/5
            hiddenEditor.buffer.setPath(path);
            hiddenEditor.buffer.loadSync(path);
            targetEditor = hiddenEditor
        }
    
        return  targetEditor;
    },

    getLine(arg) {
        var bufferPosition, editor, line;
        editor = arg.editor, bufferPosition = arg.bufferPosition;
        return line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    },
    
    getTiProjectRootPath() {
        var activeEditor = atom.workspace.getActiveTextEditor();
    
        if(activeEditor && atom.project.rootDirectories.length){
          return atom.project.relativizePath(activeEditor.getPath())[0] || '';
        }
        return '';
    },

    getAlloyRootPath() {
        let customPath = atom.config.get('titanium-alloy.alloyAppPath');
        return path.join(this.getTiProjectRootPath(), customPath || 'app');
    },

    isAlloyProject () {
        return this.isExistAsDirectory(this.getAlloyRootPath());
    },

    getI18nPath() {
        if (this.isAlloyProject() && this.isAlloy18Later() ) {
            return path.join(this.getAlloyRootPath(),'i18n');
        } else {
            return path.join(this.getTiProjectRootPath(),'i18n');
        }
    },
    
    isExistAsFile(path) {
        try {
            var stat = fs.statSync(path);
            return stat.isFile();
        } catch(err) {
            return !(err && err.code === 'ENOENT');
        }
    },

    isExistAsDirectory(path) {
        try {
            var stat = fs.statSync(path);
            return stat.isDirectory();
        } catch(err) {
            return !(err && err.code === 'ENOENT');
        }
    },

    getCustomPrefix : (function () {
        var regex = /^[	 ]*$|[^\s\\\(\)"':,;<>~!@\$%\^&\*\|\+=\[\]\{\}`\?\…]+$/;
    
        return function (request) {
            var editor = request.editor;
            var bufferPosition = request.bufferPosition;
        
            // Get the text for the line up to the triggered buffer position
            var line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        
            // Match the regex to the line, and return the match
            var matchResult = line.match(regex)
            return matchResult?matchResult[0]:'';
        }
    })(),

    toUnixPath(p) { //https://github.com/anodynos/upath
        var double;
        p = p.replace(/\\/g, '/');
        double = /\/\//;
        while (p.match(double)) {
            p = p.replace(double, '/');
        }
        return p;
    },

    getAllKeys(obj) {
        if(!_.isObject(obj)) return [];
        var result = [];
        _.each(obj, function (value,key) {
            result.push(key);
            _.each(module.exports.getAllKeys(value), function (value) {
                result.push(key+'.'+value)
            });
        });
        return result;
    },

    __guard__(value, transform) {
        return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
    },

    firstCharsEqual(str1, str2) {
        str1 = str1.replace(/\"/g,'');
        str2 = str2.replace(/\"/g,'');
        return str1[0].toLowerCase() === str2[0].toLowerCase();
    },
      
    capitalizeFirstLetter(string) {
        string.charAt(0).toUpperCase() + string.slice(1)
    }
}