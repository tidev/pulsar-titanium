'use babel';

import Utils from '../lib/utils';

describe('iOS provisioning profile matches app id', () => {

    describe('wildcard', () => {
        test('match all', () => {
            expect(Utils.iOSProvisioinngProfileMatchesAppId('*', 'com.example.app')).toBeTruthy();
            expect(Utils.iOSProvisioinngProfileMatchesAppId('*', 'com.anotherexample.app')).toBeTruthy();
        });
    });

    describe('explicit', () => {
        test('case sensitivity', () => {
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.example.app')).toBeTruthy();
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.Example.App')).toBeFalsy();
        });
        test('mismatching path components', () => {
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.example.anotherapp')).toBeFalsy();
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.anotherexample.app')).toBeFalsy();
        });
    });

    describe('prefixed wildcard', () => {
        test('match', () => {
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.example.app')).toBeTruthy();
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.anotherexample.app')).toBeFalsy();
        });

        test('case sensitivity', () => {
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.example.App')).toBeTruthy();
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.Example.app')).toBeFalsy();
        });
        test('additional path component', () => {
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.example.example.app')).toBeTruthy();
        });
    });

});