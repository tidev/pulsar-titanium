'use babel';

export default {

    // requireSuggestion({text, prefix, replacementPrefix}) {
    //     let suggestion = this.suggestion({ 
    //         type: 'require',
    //         text,
    //         prefix,
    //         replacementPrefix,
    //         priority: 1
    //     });

    //     suggestion.onDidInsertSuggestion = function({editor, triggerPosition, suggestion}) {
    //         let targetRange = [
    //             [triggerPosition.row, 0],
    //             [triggerPosition.row, triggerPosition.column]
    //         ];
    //         let originText = editor.getTextInRange(targetRange);
    //         console.log('onDidInsertSuggestion');
    //         if (!(new RegExp(`${suggestion.replacementPrefix}$`)).test(originText)) {
    //             console.log('onDidInsertSuggestion 2');
    //             console.log(`${originText}` + originText.replace(new RegExp(`${suggestion.prefix}$`), `${suggestion.text}`));
    //             return editor.setTextInBufferRange(targetRange, originText.replace(new RegExp(`${suggestion.prefix}$`), `${suggestion.text}`));
    //         }
    //     };

    //     suggestion.foo = 'bar';

    //     console.log(suggestion);

    //     return suggestion;
    // },

    sort(a,b) {
        
        if (a.text === 'App') {
            console.log(JSON.stringify(a));
        }

        if (b.text === 'App') {
            console.log(JSON.stringify(b));
        }

        // if (a.priority==0 ^ b.priority==0){
        //     console.log(a.priority + ' ' + b.priority);
        if (a.priority && b.priority && a.priority !== b.priority) {
            return b.priority - a.priority;
        } else {
            aStr = a.text || a.displayText || a.snippet || '';
            bStr = b.text || b.displayText || b.snippet || '';
            
            // return bStr.toLowerCase() - aStr.toLowerCase();
            aStr = aStr.toLowerCase();
            bStr = bStr.toLowerCase();
            
            let res = 0;
            if (aStr < bStr) {
                res = -1;
            } else if (aStr > bStr) {
                res = 1;
            }

            return res;
        }
        // } 
        // aStr = a.text || a.displayText || a.snippet || '';
        // bStr = b.text || b.displayText || b.snippet || '';
        // return aStr.length - bStr.length;
    },

    triggerAutocomplete(editor) {
        return atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', {activatedManually: false});
    },

    /**
	 * 
	 * @param {Object} opts 
	 */
    suggestion(opts) {
        
        const completions = require('../../include/completions');

        let suggestion = {
            type: opts.type,
            rightLabel: opts.tagName,
            descriptionMoreURL: this.documentationURLForAPI(opts.apiName, opts.value, opts.type),
            onDidInsertSuggestion: opts.onDidInsertSuggestion,
            prefix: opts.prefix,
            replacementPrefix: opts.replacementPrefix,
            priority: opts.priority
        };

        if (opts.text) { 
            suggestion.text = opts.text;
        } else {
            suggestion.snippet = opts.snippet;
            suggestion.displayText = opts.displayText;
        }

        // override styling 
        // TODO: check style overrides compared with https://github.com/atom/atom/blob/master/static/variables/syntax-variables.less
        if (opts.type === 'event') {
            suggestion.type = 'function';
            suggestion.iconHTML = '<i class="icon-zap"></i>';
        } else if (opts.type === 'property') {
            // suggestion.type = 'attribute';
        }
        // } else if (opts.type === 'tag') {
        // 	descriptionMoreURL: Utils.documentationURLForAPI(opts.apiName, opts.value, opts.type)
        // }

        if (opts.description) {
            suggestion.description = opts.description;
        } else if (opts.type == 'value') {
            suggestion.description = (completions.properties[opts.propertyName] != null) ? completions.properties[opts.propertyName].description : `${opts.propertyName} property`;
        } else if (opts.value) {
            // if (opts.type == 'value') {
            //     suggestion.description = (this.properties[opts.propertyName] != null) ? this.properties[opts.propertyName].description : `${opts.propertyName} property`;
                // if (!suggestion.description) { 
                    // description = `${valueInfo[0]} value for the ${propertyName} property`; 
                    // suggestion.description = `${opts.apiName} ${opts.value} ${opts.type}`;
                // }
            // } else {
                suggestion.description = `${opts.apiName} ${opts.value} ${opts.type}`;
            // }
            
        } else {
            const apiObj = completions.types[opts.apiName];
            if (apiObj) {
                suggestion.description = `${opts.apiName}: ${completions.types[opts.apiName].description.replace('\n', '')}`;
            } else {
                suggestion.description = opts.apiName;
            }
        }

        // console.log(JSON.stringify(opts.onDidInsertSuggestion, null, 4));
        

        return suggestion;
    },

    /**
     * 
     * documentationURLforAPI
     * 
     * @param {String} name     object name
     * @param {String} value    method, property or event name (optional)
     * @param {String} type     method | property | event (optional)
     */
    documentationURLForAPI(name, value, type) {
        if (!name) {
            return null;
        }
        const apiRoot = 'http://docs.appcelerator.com/platform/latest/#!/api/';
        name = name.replace('Ti','Titanium');
        name = name.replace('Alloy.Abstract.','');

        if (value && (type === 'method' || type === 'property' || type === 'event')) {
            return `${apiRoot}${name}-${type}-${value}`;
        }
        return `${apiRoot}${name}`;
    }
}
