'use babel';

import Utils from '../lib/utils';

describe('iOS provisioning profile matches app ID', () => {

    describe('Wildcard app ID', () => {
        it('should match all', () => {
            expect(Utils.iOSProvisioinngProfileMatchesAppId('*', 'com.example.app')).toBeTruthy();
            expect(Utils.iOSProvisioinngProfileMatchesAppId('*', 'com.anotherexample.app')).toBeTruthy();
        });
    });

    describe('Explicit app ID', () => {
        it('should match case sensitivity', () => {
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.example.app')).toBeTruthy();
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.Example.App')).toBeFalsy();
        });
        it('mismatching path components', () => {
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.example.anotherapp')).toBeFalsy();
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.anotherexample.app')).toBeFalsy();
        });
    });

    describe('Prefixed wildcard app ID', () => {
        it('should match', () => {
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.example.app')).toBeTruthy();
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.anotherexample.app')).toBeFalsy();
        });

        it('case sensitivity', () => {
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.example.App')).toBeTruthy();
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.Example.app')).toBeFalsy();
        });
        it('additional path component', () => {
            expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.example.example.app')).toBeTruthy();
        });
    });

});