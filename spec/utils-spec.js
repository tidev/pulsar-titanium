'use babel';

/* eslint-env mocha */
/* global expect */

import Utils from '../lib/utils';

describe('iOS provisioning profile matches app ID', function () {

	describe('Wildcard app ID', function () {
		it('should match all', function () {
			expect(Utils.iOSProvisioinngProfileMatchesAppId('*', 'com.example.app')).to.be.ok;
			expect(Utils.iOSProvisioinngProfileMatchesAppId('*', 'com.anotherexample.app')).to.be.ok;
		});
	});

	describe('Explicit app ID', function () {
		it('should match case sensitivity', function () {
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.example.app')).to.be.ok;
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.Example.App')).not.to.be.ok;
		});
		it('mismatching path components', function () {
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.example.anotherapp')).not.to.be.ok;
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.app', 'com.anotherexample.app')).not.to.be.ok;
		});
	});

	describe('Prefixed wildcard app ID', function () {
		it('should match', function () {
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.example.app')).to.be.ok;
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.anotherexample.app')).not.to.be.ok;
		});

		it('case sensitivity', function () {
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.example.App')).to.be.ok;
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.Example.app')).not.to.be.ok;
		});
		it('additional path component', function () {
			expect(Utils.iOSProvisioinngProfileMatchesAppId('com.example.*', 'com.example.example.app')).to.be.ok;
		});
	});

});
