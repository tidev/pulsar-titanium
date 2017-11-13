'use babel';

import viewAutoCompleteProvider from '../lib/providers/viewAutoCompleteProvider';

let editor;
function initTextEditor(text) {
    editor = atom.workspace.buildTextEditor();
    editor.setGrammar(atom.grammars.grammarForScopeName('text.alloyxml'));
    editor.insertText(text);
}

function getSuggestions(prefix) {
    return viewAutoCompleteProvider.getSuggestions({
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
        initTextEditor('<W');
        suggestions = getSuggestions('W');

        expect(suggestions.length).toBe(4);

        expect(suggestions[0].type).toBe('tag');
        expect(suggestions[0].displayText).toBe('WebView');
        expect(suggestions[0].snippet).toBe('WebView$1>$2</WebView>');
        expect(suggestions[0].rightLabel).toBe('Ti.UI.WebView');
        expect(suggestions[0].description).toBe('Ti.UI.WebView: The web view allows you to open an HTML5 based view which can load either local or remote content. ');
        expect(suggestions[0].descriptionMoreURL).toBe('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.WebView');

        expect(suggestions[1].type).toBe('tag');
        expect(suggestions[1].displayText).toBe('Widget');
        expect(suggestions[1].snippet).toBe('Widget$1>$2</Widget>');
        expect(suggestions[1].rightLabel).toBe('Alloy.Widget');
        expect(suggestions[1].description).toBe('Alloy.Widget: Widgets are self-contained components that can be easily dropped into an Alloy project.');
        expect(suggestions[1].descriptionMoreURL).toBe('http://docs.appcelerator.com/platform/latest/#!/api/Alloy.Widget');

        expect(suggestions[2].type).toBe('tag');
        expect(suggestions[2].displayText).toBe('Window');
        expect(suggestions[2].snippet).toBe('Window$1>$2</Window>');
        expect(suggestions[2].rightLabel).toBe('Ti.UI.Window');
        expect(suggestions[2].description).toBe('Ti.UI.Window: The Window is an empty drawing surface or container.');
        expect(suggestions[2].descriptionMoreURL).toBe('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window');

        expect(suggestions[3].type).toBe('tag');
        expect(suggestions[3].displayText).toBe('WindowToolbar');
        expect(suggestions[3].snippet).toBe('WindowToolbar$1>$2</WindowToolbar>');
        expect(suggestions[3].rightLabel).toBe('Ti.UI.Window.WindowToolbar');
        expect(suggestions[3].description).toBe('Ti.UI.Window.WindowToolbar');
        expect(suggestions[3].descriptionMoreURL).toBe('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window.WindowToolbar');

    });

});

describe('Attribute suggestions', () => {
    
        it('should provide property suggestions', () => {
            initTextEditor('<Window s');
            suggestions = getSuggestions('status');
    
            expect(suggestions.length).toBe(7);
    
            expect(suggestions[0].type).toBe('property');
            expect(suggestions[0].displayText).toBe('scaleX');
            expect(suggestions[0].snippet).toBe('scaleX="$1"$0');
            expect(suggestions[0].rightLabel).toBe('Window');
            expect(suggestions[0].description).toBe('Ti.UI.Window: Scaling of the view in x-axis in pixels.');
            expect(suggestions[0].descriptionMoreURL).toBe('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window-property-scaleX');
        });

        it('should provide event suggestions for', () => {
            initTextEditor('<Window on');
            suggestions = getSuggestions('on');
    
            expect(suggestions.length).toBe(35);
    
            expect(suggestions[0].type).toBe('function');
            expect(suggestions[0].displayText).toBe('onAndroidback');
            expect(suggestions[0].snippet).toBe('onAndroidback="$1"$0');
            expect(suggestions[0].rightLabel).toBe('Window');
            expect(suggestions[0].description).toBe('Ti.UI.Window: androidback event');
            expect(suggestions[0].descriptionMoreURL).toBe('http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.Window-event-androidback');
        });

    });