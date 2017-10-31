/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const tagRegExp =  /(<([^>]+)>)/ig;
const Utils = require('../utils');
const related = require('../related');
const _ = require('underscore');
let find = require('find');
const path = require('path');
const { parseString } = require('xml2js');
const { getLine } = Utils;
find = require('find');

module.exports = {
  cfg: {
    regExp : /Alloy\.CFG\.([-a-zA-Z0-9-_\/]*)$/,
    getCompletions(request) {
      let completions = undefined;
      const line = getLine(request);
      
      if (this.regExp.test(line)) {
        const cfgPath = path.join(Utils.getAlloyRootPath(),'config.json');
        const cfgKeys = [];
        completions = [];
        if (Utils.isExistAsFile(cfgPath)) {
          try {
            // merge ally evn and platform(os) keys
            let cfgObj = JSON.parse(Utils.getFileEditor(cfgPath).getText());
            cfgObj = _.reduce(cfgObj, function(memo, value, key) {
              if ((key === "global") || key.startsWith('env:') || key.startsWith('os:')) {
                return _.extend(memo,value);
              } else {
                return memo;
              }
            }
            , {});
            
            const allKeys = Utils.getAllKeys(cfgObj);
            
            for (let key of Array.from(allKeys)) {
              completions.push({
                text: key,
                type: 'variable'
              });
            }
                
                // leftLabel : defaultLang
                // rightLabel: value._
                // replacementPrefix : Utils.getCustomPrefix(request)
                // description : value._
                // 
          } catch (error) {
            console.log(error);
          }
        }
      }
          
      
      
      return completions;
    }
    
  },
  i18n : {
    // regExp : /L\(["']([-a-zA-Z0-9-_\/]*)$/
    regExp : /L\(["']([^\s\\\(\)"':,;<>~!@\$%\^&\*\|\+=\[\]\{\}`\?\…]*)$/,
    getCompletions(request) {
      let completions = undefined;
      const line = getLine(request);
      const alloyRootPath = Utils.getAlloyRootPath();
      if (this.regExp.test(line)) {
        const defaultLang = atom.config.get('titanium-alloy.defaultI18nLanguage');
        const i18nStringPath = path.join(Utils.getI18nPath(),defaultLang,"strings.xml");
        
        completions = [];
        if (Utils.isExistAsFile(i18nStringPath)) {
          parseString(Utils.getFileEditor(i18nStringPath).getText(), (error,result) =>
            _.each(__guard__(result != null ? result.resources : undefined, x => x.string) || [], value =>
              completions.push({ 
                text: value.$.name,
                leftLabel : defaultLang,
                rightLabel: value._,
                type: 'variable',
                replacementPrefix : Utils.getCustomPrefix(request),
                description : value._
              })
              
              // completions.push 
              //   snippet: "x${0:#{value._}}#{value.$.name}"
              //   displayText: "#{value._}"
              //   leftLabel : defaultLang
              //   rightLabel: value.$.name
              //   type: 'value'
              //   replacementPrefix : Utils.getCustomPrefix(request)
              //   
              
              // i18n key finder로 개별 package 고려
              
              )
          );
        }
      }
      return completions;
    }
  },
  path : {
    regExp : /["']\/i([-a-zA-Z0-9-_\/]*)$/,
    getCompletions(request) {
      const {prefix} = request;
      let completions = undefined;
      const line = getLine(request);
      const alloyRootPath = Utils.getAlloyRootPath();
      const assetPath = path.join(alloyRootPath,'assets');
      const imgPath = path.join(assetPath,'images');
      
      if (this.regExp.test(line) && Utils.isExistAsDirectory(imgPath)) {
        completions = [];
        const files = find.fileSync(imgPath);
        for (let file of Array.from(files)) {
          // if currentPath != file # exclude current controller
          if (file.endsWith('.DS_Store')) { continue; }
          if (file.includes('@')) { continue; }
          completions.push({
            text: Utils.toUnixPath(file.replace(assetPath,'')),
            type: 'file',
            replacementPrefix : Utils.getCustomPrefix(request),
            iconHTML : `<image style='background-position: center; background-repeat: no-repeat; background-size: contain; background-image: url(${file}); height:29px; width:29px; '></image>`
          });
        }
      }
      return completions;
    }
  }
};
function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}