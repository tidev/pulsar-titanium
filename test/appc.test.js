'use babel';

import Appc from '../lib/appc';
import info from 'data/ti_info';

Appc.info = info;

describe('ti info', () => {

    test('sdks', () => {
        expect(Object.keys(Appc.info.titanium).length).toBe(13);
    });

});


describe('iOS simulators', () => {


});

describe('Android emulators', () => {
    
        
});

describe('iOS certificates', () => {
    
    
});

describe('iOS provisioning profiles', () => {
    
        
});