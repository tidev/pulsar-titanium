'use babel';

/* eslint-env mocha */

import Appc from '../lib/appc';
import Utils from '../lib/utils';
import info from './data/ti_info';

Appc.info = info;

describe('iOS provisioning profile matches app ID', function () {

	describe('Wildcard app ID', function () {
		it('should match all', function () {
			expect(Utils.iOSProvisioningProfileMatchesAppId('*', 'com.example.app')).to.be.ok;
			expect(Utils.iOSProvisioningProfileMatchesAppId('*', 'com.anotherexample.app')).to.be.ok;
		});
	});

	describe('Explicit app ID', function () {
		it('should match case sensitivity', function () {
			expect(Utils.iOSProvisioningProfileMatchesAppId('com.example.app', 'com.example.app')).to.be.ok;
			expect(Utils.iOSProvisioningProfileMatchesAppId('com.example.app', 'com.Example.App')).not.to.be.ok;
		});
		it('mismatching path components', function () {
			expect(Utils.iOSProvisioningProfileMatchesAppId('com.example.app', 'com.example.anotherapp')).not.to.be.ok;
			expect(Utils.iOSProvisioningProfileMatchesAppId('com.example.app', 'com.anotherexample.app')).not.to.be.ok;
		});
	});

	describe('Prefixed wildcard app ID', function () {
		it('should match', function () {
			expect(Utils.iOSProvisioningProfileMatchesAppId('com.example.*', 'com.example.app')).to.be.ok;
			expect(Utils.iOSProvisioningProfileMatchesAppId('com.example.*', 'com.anotherexample.app')).not.to.be.ok;
		});

		it('case sensitivity', function () {
			expect(Utils.iOSProvisioningProfileMatchesAppId('com.example.*', 'com.example.App')).to.be.ok;
			expect(Utils.iOSProvisioningProfileMatchesAppId('com.example.*', 'com.Example.app')).not.to.be.ok;
		});
		it('additional path component', function () {
			expect(Utils.iOSProvisioningProfileMatchesAppId('com.example.*', 'com.example.example.app')).to.be.ok;
		});
	});
});

describe('#getCorrectCertificateName', function () {

	it('Should return correct name property for <8.2.0', function () {
		const certificate = Utils.getCorrectCertificateName('iPhone Developer: Mrs Developer (D4BDS41234)', '8.1.1.GA', 'developer');
		expect(certificate).to.equal('Mrs Developer (D4BDS41234)');

	});

	it('Should return correct name property for >=8.2.0', function () {
		const certificate = Utils.getCorrectCertificateName('iPhone Developer: Mrs Developer (D4BDS41234)', '8.2.0.GA', 'developer');
		expect(certificate).to.equal('iPhone Developer: Mrs Developer (D4BDS41234)');
	});
});

describe('#getConfigSetting', () => {

	beforeEach(() => {
		atom.config.clear();
	});

	it('should handle mapping config values that start with appcelerator-titanium', async () => {
		atom.config.set('appcelerator-titanium.general.screenshotPath', 'test');
		expect(Utils.getConfigSetting('appcelerator-titanium.general.screenshotPath')).to.equal('test');
	});

	it('should handle mapping config values that start with titanium', async () => {
		atom.config.set('titanium.general.screenshotPath', 'test');
		expect(Utils.getConfigSetting('titanium.general.screenshotPath')).to.equal('test');
	});

	it('should handle mapping config values that start with nothing', async () => {
		atom.config.set('titanium.general.screenshotPath', 'test');
		expect(Utils.getConfigSetting('general.screenshotPath')).to.equal('test');
	});

	it('should handle falling back to looking up against the previous namespace', async () => {
		atom.config.set('appcelerator-titanium.general.screenshotPath', 'test');
		expect(Utils.getConfigSetting('titanium.general.screenshotPath')).to.equal('test');
	});
});
