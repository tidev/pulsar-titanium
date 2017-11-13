'use babel';

import styleAutoCompleteProvider from '../lib/providers/styleAutoCompleteProvider';

let editor;
function initTextEditor(text) {
    editor = atom.workspace.buildTextEditor();
    editor.setGrammar(atom.grammars.grammarForScopeName('source.css.tss'));
    editor.insertText(text);
}

function getSuggestions(prefix) {
    return styleAutoCompleteProvider.getSuggestions({
        editor, 
        bufferPosition: editor.getCursorBufferPosition(),
        scopeDescriptor: editor.scopeDescriptorForBufferPosition(editor.getCursorBufferPosition()),
        prefix
    });
}

beforeEach(() => {
    waitsForPromise(() => 
        atom.packages.activatePackage('appcelerator-titanium')
    );
});

describe('Tag suggestions', () => {
    
    it('should provide tag suggestions', () => {
        initTextEditor('"W');
        suggestions = getSuggestions('W');

        expect(suggestions.length).toBe(4);
        
        expect(suggestions[0].type).toBe('tag');
        expect(suggestions[0].text).toBe('WebView');
        expect(suggestions[0].rightLabel).toBe('Ti.UI.WebView');
        expect(suggestions[0].description).toBe('Ti.UI.WebView: The web view allows you to open an HTML5 based view which can load either local or remote content. ');
        expect(suggestions[0].descriptionMoreURL).toBe('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.WebView');

        expect(suggestions[1].type).toBe('tag');
        expect(suggestions[1].text).toBe('Widget');
        expect(suggestions[1].rightLabel).toBe('Alloy.Widget');
        expect(suggestions[1].description).toBe('Alloy.Widget: Widgets are self-contained components that can be easily dropped into an Alloy project.');
        expect(suggestions[1].descriptionMoreURL).toBe('http://docs.appcelerator.com/platform/latest/#!/api/Alloy.Widget');

        expect(suggestions[2].type).toBe('tag');
        expect(suggestions[2].text).toBe('Window');
        expect(suggestions[2].rightLabel).toBe('Ti.UI.Window');
        expect(suggestions[2].description).toBe('Ti.UI.Window: The Window is an empty drawing surface or container.');
        expect(suggestions[2].descriptionMoreURL).toBe('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window');

        expect(suggestions[3].type).toBe('tag');
        expect(suggestions[3].text).toBe('WindowToolbar');
        expect(suggestions[3].rightLabel).toBe('Ti.UI.Window.WindowToolbar');
        expect(suggestions[3].description).toBe('Ti.UI.Window.WindowToolbar');
        expect(suggestions[3].descriptionMoreURL).toBe('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window.WindowToolbar');
    });
});

describe('Property suggestions', () => {

    it('should provide property name suggestions', () => {
        initTextEditor('"#id":{s');
        suggestions = getSuggestions('s');

        expect(suggestions[0].type).toBe('property');
        expect(suggestions[0].displayText).toBe('saveToPhotoGallery');
        expect(suggestions[0].snippet).toBe('saveToPhotoGallery: ');

        expect(suggestions[1].type).toBe('property');
        expect(suggestions[1].displayText).toBe('scale');
        expect(suggestions[1].snippet).toBe('scale: ');

        expect(suggestions[2].type).toBe('property');
        expect(suggestions[2].displayText).toBe('scalesPageToFit');
        expect(suggestions[2].snippet).toBe('scalesPageToFit: ');
    });

    it('should provide correct snippet for object types', () => {
        initTextEditor('"#id":{f');
        suggestions = getSuggestions('f');

        // find 'font' suggestion
        const fontSuggestion = suggestions.find(suggestion => suggestion.displayText === 'font');

        expect(fontSuggestion.type).toBe('property');
        expect(fontSuggestion.snippet).toBe('font: {\n\t\${1}\t\n}');
    });

    it('should provide property value suggestions', () => {
        initTextEditor('"#id":{');
        editor.insertNewline();
        editor.insertText('separatorStyle:');
        suggestions = getSuggestions('');

        expect(suggestions.length).toBe(2);

        expect(suggestions[0].type).toBe('value');
        expect(suggestions[0].text).toBe('Ti.UI.TABLE_VIEW_SEPARATOR_STYLE_NONE');

        expect(suggestions[1].type).toBe('value');
        expect(suggestions[1].text).toBe('Ti.UI.TABLE_VIEW_SEPARATOR_STYLE_SINGLE_LINE');
    });

    it('should provide property no value suggestions with invalid prefix', () => {
        initTextEditor('"#id":{');
        editor.insertNewline();
        editor.insertText('separatorStyle:');
        suggestions = getSuggestions('s');

        expect(suggestions.length).toBe(0);
    });
});