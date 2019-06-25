'use babel';

/* eslint-env mocha */

import Appc from '../lib/appc';
import info from './data/ti_info';

Appc.info = info;

describe('SDKs', function () {

	describe('All SDKs', function () {
		it('should list all SDKs', function () {
			const sdks = Appc.sdks();
			expect(sdks.length).to.equal(7);
			expect(sdks[0].version).to.equal('7.0.0');
			expect(sdks[0].fullversion).to.equal('7.0.0.v20170815160201');
		});

		it('should retrieve the latest SDK', function () {
			expect(Appc.latestSdk(false).fullversion).to.equal('7.0.0.v20170815160201');
		});
	});

	describe('GA SDKs', function () {
		it('should list all GA SDKs', function () {
			const sdks = Appc.sdks(true);
			expect(sdks.length).to.equal(2);
			expect(sdks[0].version).to.equal('6.1.2');
			expect(sdks[0].fullversion).to.equal('6.1.2.GA');
		});

		it('should retrieve the latest GA SDK', function () {
			expect(Appc.latestSdk().fullversion).to.equal('6.1.2.GA');
		});
	});

});

describe('iOS certificates', function () {

	it('should list all developer certificates', function () {
		const certificates = Appc.iosCertificates();
		expect(certificates.length).to.equal(2);
		expect(certificates[0].name).to.equal('Mrs Developer (D4BDS41234)');
	});

	it('should list all distribution certificates', function () {
		const certificates = Appc.iosCertificates('distribution');
		expect(certificates.length).to.equal(3);
		expect(certificates[0].name).to.equal('Mrs Developer (VNUS781234)');
	});

});

describe('iOS provisioning profiles', function () {

	describe('Development profiles', function () {

		it('should list all', function () {
			const profiles = Appc.iosProvisioningProfiles();
			expect(profiles.length).to.equal(3);
			expect(profiles[0].name).to.equal('Wildcard development');
			expect(profiles[0].team[0]).to.equal('M57HQFB894');
		});

		it('should match certificate', function () {
			const certificate = Appc.iosCertificates()[0];
			const profiles = Appc.iosProvisioningProfiles('development', certificate);
			expect(profiles.length).to.equal(3);
			const enabledProfiles = profiles.filter((profile) => {
				return !profile.disabled;
			});
			expect(enabledProfiles.length).to.equal(1);
			expect(enabledProfiles[0].name).to.equal('Appcelerator Development Profile');
			expect(enabledProfiles[0].team[0]).to.equal('WOUS58744L');
		});

		it('should match certificate and app ID', function () {
			const certificate = Appc.iosCertificates()[0];
			const profiles = Appc.iosProvisioningProfiles('development', certificate, 'com.appcelerator.test');
			expect(profiles.length).to.equal(3);
			const enabledProfiles = profiles.filter((profile) => {
				return !profile.disabled;
			});
			expect(enabledProfiles.length).to.equal(1);
			expect(enabledProfiles[0].name).to.equal('Appcelerator Development Profile');
			expect(enabledProfiles[0].team[0]).to.equal('WOUS58744L');
		});

		it('should match certificate and not app ID', function () {
			const certificate = Appc.iosCertificates()[0];
			const profiles = Appc.iosProvisioningProfiles('development', certificate, 'com.axway.test');
			expect(profiles.length).to.equal(3);
			const enabledProfiles = profiles.filter((profile) => {
				return !profile.disabled;
			});
			expect(enabledProfiles.length).to.equal(0);
		});

	});

});
