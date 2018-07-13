'use babel';

/* eslint-env mocha */
/* global expect */

import Utils from '../lib/utils';

describe('iOS provisioning profile matches app ID', function () {

	describe('Wildcard app ID', function () {
		it('should match all', function () {
			expect(Utils.iOSProvisioinngProfileMatchesAppId('*', 'com.example.app')).toBeTruthy();
			expect(Utils.iOSProvisioinngProfileMatchesAppId('*', 'com.anotherexample.app')).toBeTruthy();
		});
	});

	describe('Explicit app ID', function () {
		it('should match case sensitivity', function () {
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.example.app')).toBeTruthy();
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.Example.App')).toBeFalsy();
		});
		it('mismatching path components', function () {
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.example.anotherapp')).toBeFalsy();
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.anotherexample.app')).toBeFalsy();
		});
	});

	describe('Prefixed wildcard app ID', function () {
		it('should match', function () {
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.example.app')).toBeTruthy();
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.anotherexample.app')).toBeFalsy();
		});

		it('case sensitivity', function () {
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.example.App')).toBeTruthy();
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.Example.app')).toBeFalsy();
		});
		it('additional path component', function () {
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.example.example.app')).toBeTruthy();
		});
	});

});
