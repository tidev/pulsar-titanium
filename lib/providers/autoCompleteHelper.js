'use babel';

export default {

    /**
     * Sort completions
     * - by priority
     * - alphabetically
     * 
     * @param {Object} a 
     * @param {Object} b 
     */
    sort(a,b) {

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
    },

    /**
     * Trigger auto-complete
     * 
     * @param {Object} editor 
     */
    triggerAutocomplete(editor) {
        return atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', {activatedManually: false});
    },

    /**
	 * Auto-complete suggestion
     * 
	 * @param {Object} opts 
     * 
     * @param {String} type         suggestion type: tag, method, property, value, #, .
     * @param {String} text         suggestion
     * @param {String} snippet      suggestion replacement text
     * @param {String} displayText  when specifying snippet
     * @param {String} description  override generated description
     * @param {Boolean} deprecated  
     * 
     * @param {String} api          e.g. Ti.UI.Window
     * @param {String} apiShortName e.g. Window
     * @param {String} property     e.g. statusBarStyle
     * @param {String} value        e.g. Ti.UI.StatusBarStyle.DEFAULT
     * 
     * @param {String} prefix
     * @param {String} replacementPrefix
     * @param {Function} onDidInsertSuggestion
	 */
    suggestion({type, text, snippet, displayText, description, deprecated, api, apiShortName, property, value, prefix, replacementPrefix, onDidInsertSuggestion}) {
        
        const completions = require('./completions');

        if (!apiShortName && api) apiShortName = api.split('.').pop();

        let suggestion = {
            type: type,
            rightLabel: (type === 'tag') ? api : apiShortName,
            descriptionMoreURL: this.documentationURLForAPI(api, property, type),
            onDidInsertSuggestion: onDidInsertSuggestion,
            prefix: prefix,
            replacementPrefix: replacementPrefix,
            priority: 2
        };

        if (text) { 
            suggestion.text = text;
        } else {
            suggestion.snippet = snippet;
            suggestion.displayText = displayText;
        }

        // override styling 
        // TODO: check style overrides compared with https://github.com/atom/atom/blob/master/static/variables/syntax-variables.less
        if (type === 'event') {
            suggestion.type = 'function';
            suggestion.iconHTML = '<i class="icon-zap"></i>';
        } else if (type === 'property') {
            // suggestion.type = 'attribute';
        }
        // } else if (type === 'tag') {
        // 	descriptionMoreURL: Utils.documentationURLForAPI(api, value, type)
        // }

        if (description) {
            suggestion.description = description;
        } else if (type === 'property' || type === 'method' || type === 'event') {
            suggestion.description = (api) ? `${api}: ` : '';
            if (completions.properties[property]) {
                suggestion.description += completions.properties[property].description.replace('\n', '');
            } else {
                suggestion.description += `${property} ${type}`;
            }
        } else if (type === 'value' ) {

        } else if (api) {
            const apiObj = completions.types[api];
            if (apiObj) {
                suggestion.description = `${api}: ${completions.types[api].description.replace('\n', '')}`;
            } else {
                suggestion.description = api;
            }
        }

        if (deprecated) {
            suggestion.priority -= 1;

            if (suggestion.rightLabel) {
                suggestion.rightLabel = `${suggestion.rightLabel} (DEPRECATED)`;
            } else {
                suggestion.rightLabel = '(DEPRECATED)';
            }
        }

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