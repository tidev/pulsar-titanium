'use babel';

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// This is based on https://github.com/atom/autocomplete-html/blob/master/lib/provider.coffee

import fs from 'fs';
import path from 'path';
import _ from 'underscore';
import find from 'find';
import Utils from '../utils';
import Appc from '../appc';
import related from '../related';
import alloyCompletionRules from './alloyCompletionRules';
import autoCompleteHelper from './autoCompleteHelper';

const trailingWhitespace = /\s$/;
const attributePattern = /\s+([a-zA-Z][-a-zA-Z]*)\s*=\s*$/;
const wrapperTagPattern = /<([a-zA-Z][-a-zA-Z]*)(.*?)>(?:\s*|$)/;

const getDirectories = srcpath =>
  fs.readdirSync(srcpath).filter(file => fs.statSync(path.join(srcpath, file)).isDirectory())
;

module.exports = {
  selector: '.text.xml',
  disableForSelector: 'text.xml .comment',
  filterSuggestions: true,
  inclusionPriority: 1,
  excludeLowerPriority: true,
  suggestionPriority: 2,

  getSuggestions(request) {
    const {editor, bufferPosition} = request;
    // console.log request.editor.getPath();
    // console.log 'tiappxmlProvider'
    if (!request.editor.getPath().endsWith('tiapp.xml')) {
      return;
    }
    
    const scopes = request.scopeDescriptor.getScopesArray();
    const completions = [];
    
    const tag = this.getPreviousTag(editor, bufferPosition);
    
    //
    // SDK version
    //
    if (tag === 'sdk-version') {
      const sdks = Appc.sdks();
      for (let idx in sdks) {
        completions.push({
          text: sdks[idx].fullversion,
          displayText: sdks[idx].fullversion
        });
      }

    //
    // Module
    //
    } else if (tag === 'module') {
      const modulePath = path.join(Utils.getTiProjectRootPath(),'modules');
      if (!Utils.isExistAsDirectory(modulePath)) { return; }
      const modules = {};
      _.each(getDirectories(modulePath), function(platform) {
        // body...
        const platformModulePath = path.join(Utils.getTiProjectRootPath(),'modules', platform);
        return _.each(getDirectories(platformModulePath) , function(moduleName) {
          if (!modules[moduleName]) { modules[moduleName] = {}; }
          const curModule = modules[moduleName];
          return curModule.platform = (curModule.platform || []).concat(platform);
        });
      });
      for (let key in modules) {
        // console.log key
        completions.push({
          text : key,
          rightLabel: modules[key].platform.join(',')
        });
      }
    }
    
    // console.log(completions);
    // completions.sort(autoCompleteHelper.sort);

    return completions;
  },

  onDidInsertSuggestion({editor, suggestion}) {
    if (suggestion.type === 'attribute') { return setTimeout(autoCompleteHelper.triggerAutocomplete.bind(this, editor), 1); }
  },

  getPreviousTag(editor, bufferPosition) {
    let {row} = bufferPosition;
    while (row >= 0) {
      const tag = __guard__(wrapperTagPattern.exec(editor.lineTextForBufferRow(row)), x => x[1]);
      if (tag) { return tag; }
      row--;
    }
  },
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}