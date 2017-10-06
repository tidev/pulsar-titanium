'use babel';

import Appc from '../lib/appc';
import info from './data/ti_info';

Appc.info = info;

describe('sdks', () => {

    describe('all sdks', () => {
        test('list', () => {
            const sdks = Appc.sdks();
            expect(sdks.length).toBe(7);
            expect(sdks[0].version).toBe('7.0.0');
            expect(sdks[0].fullversion).toBe('7.0.0.v20170815160201');
        });

        test('latest', () => {
            expect(Appc.latestSdk(false).fullversion).toBe('7.0.0.v20170815160201');
        });
    });

    describe('GA sdks', () => {
        test('list', () => {
            const sdks = Appc.sdks(true);
            expect(sdks.length).toBe(2);
            expect(sdks[0].version).toBe('6.1.2');
            expect(sdks[0].fullversion).toBe('6.1.2.GA');
        });

        test('latest', () => {
            expect(Appc.latestSdk().fullversion).toBe('6.1.2.GA');
        });
    });

});

describe('iOS certificates', () => {
    
    test('developer', () => {
        const certificates = Appc.iosCertificates();
        expect(certificates.length).toBe(2);
        expect(certificates[0].name).toBe('Mrs Developer (D4BDS41234)');
    });
    
    test('distribution', () => {
        const certificates = Appc.iosCertificates('distribution');
        expect(certificates.length).toBe(3);
        expect(certificates[0].name).toBe('Mrs Developer (VNUS781234)');
    });
    
});

describe('iOS provisioning profiles', () => {
    
    describe('development', () => {

        test('all', () => {
            const profiles = Appc.iosProvisioningProfiles();
            expect(profiles.length).toBe(3);
            expect(profiles[0].name).toBe('Wildcard development');
            expect(profiles[0].team[0]).toBe('M57HQFB894');
        });

        test('match certificate', () => {
            const certificate = Appc.iosCertificates()[0];
            const profiles = Appc.iosProvisioningProfiles('development', certificate);
            expect(profiles.length).toBe(3);
            const enabledProfiles = profiles.filter((profile) => {
                return !profile.disabled;
            });
            expect(enabledProfiles.length).toBe(1);
            expect(enabledProfiles[0].name).toBe('Appcelerator Development Profile');
            expect(enabledProfiles[0].team[0]).toBe('WOUS58744L');
        });

        test('match certificate and app ID', () => {
            const certificate = Appc.iosCertificates()[0];
            const profiles = Appc.iosProvisioningProfiles('development', certificate, 'com.appcelerator.test');
            expect(profiles.length).toBe(3);
            const enabledProfiles = profiles.filter((profile) => {
                return !profile.disabled;
            });
            expect(enabledProfiles.length).toBe(1);
            expect(enabledProfiles[0].name).toBe('Appcelerator Development Profile');
            expect(enabledProfiles[0].team[0]).toBe('WOUS58744L');
        });
        
        test('match certificate not app ID', () => {
            const certificate = Appc.iosCertificates()[0];
            const profiles = Appc.iosProvisioningProfiles('development', certificate, 'com.axway.test');
            expect(profiles.length).toBe(3);
            const enabledProfiles = profiles.filter((profile) => {
                return !profile.disabled;
            });
            expect(enabledProfiles.length).toBe(0);
        });

    });
        
});