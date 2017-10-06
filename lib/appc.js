'use babel'

import {BufferedProcess} from 'atom';
import Utils from './utils';

var Appc = {

    info: {},

    /**
     * get info
     * 
     * @param {Function} callback
     */
    getInfo: function(callback) {
        const spawn = require('child_process').spawn;
        const proc = spawn('appc', ['info', '-o', 'json'], {shell: true});

        let result = '';

        proc.stdout.on('data', (data) => {
          result += data;
        });

        proc.stderr.on('data', (data) => {
          console.error(`${data}`);
          atom.notifications.addError('Error fetching environment information. Ensure you have installed Appcelerator CLI tools.', {detail: data, dismissable: true});
        });

        proc.on('close', (code) => {
            if (result && result.length) {
                Appc.info = JSON.parse(result);
                callback && callback(Appc.info);
            } else {
                callback && callback({});
            }

        });
    },


    //-------------------------------------------------------------------------


    /**
     * SDKs
     * 
     * @param {Boolean} isGA    limit to only GA releases, default false
     * @return {Array}
     */
    sdks: function(isGA = false) {
        if (Appc.info.titanium) {
            let keys = Object.keys(Appc.info.titanium);
            keys.forEach(function(key){
                Appc.info.titanium[key].fullversion = key;
            });

            keys.sort((a, b) => {
                const aVersion = a.substr(0, a.lastIndexOf('.'));
                const aSuffix = a.substr(a.lastIndexOf('.')+1);
                const bVersion = b.substr(0, b.lastIndexOf('.'));
                const bSuffix = b.substr(b.lastIndexOf('.')+1);

                if (aVersion < bVersion) {
                    return 1;
                } else if (aVersion > bVersion) {
                    return -1;
                } else {
                    if (aSuffix === bSuffix) {
                        return 0;
                    } else if (aSuffix == 'GA') {
                        return -1;
                    } else if (bSuffix == 'GA') {
                        return 1;
                    } else if (aSuffix == 'RC') {
                        return -1;
                    } else if (bSuffix == 'RC') {
                        return 1;
                    } else if (aSuffix < bSuffix) {
                        return 1;
                    } else if (aSuffix > bSuffix) {
                        return -1;
                    }
                    return 0;
                }
            });

            if (isGA) {
                keys = keys.filter(key => key.indexOf('GA') > 0);
            }

            return keys.map(key => Appc.info.titanium[key]);
        }
        return [];
    },

    /**
     * latest SDKs
     * 
     * @param {Boolean} isGA    limit to only GA releases, default false
     * @param {Object} SDK      latest SDK based on version number
     */
    latestSdk: function(isGA = true) {
        const sdks = Appc.sdks(isGA);
        if (sdks.length > 0) {
            return sdks[0];
        }
    },


    //-------------------------------------------------------------------------

    
    /**
     * iOS simulators
     * 
     * @return {Object}
     */
    iOSSimulators: function() {
        if (Appc.info.ios && Appc.info.ios.simulators) {
            return Appc.info.ios.simulators.ios;
        }
        return {};
    },

    /**
     * iOS devices
     * 
     * @return {Array}
     */
    iOSDevices: function() {
        if (Appc.info.ios && Appc.info.ios.devices) {
            return Appc.info.ios.devices;
        }
        return [];
    },

    /**
     * iOS targets
     * 
     * @return {Object}
     */
    iOSTargets: function() {
        return {
            devices: this.iOSDevices(),
            simulators: this.iOSSimulators()
        };
    },

    /**
     * Android emulators
     * 
     * @return {Object}
     */
    androidEmulators: function() {
        if (Appc.info.android && Appc.info.android.emulators.length) {
            var emulators = {
                AVDs: [],
                Genymotion: []
            }
            Appc.info.android.emulators.forEach(function(emulator){
                if (emulator.type == 'avd') emulators.AVDs.push(emulator);
                else if (emulator.type == 'genymotion') emulators.Genymotion.push(emulator);
            });
            return emulators;
        }
        return {};
    },

    /**
     * Android devices
     * 
     * @return {Array}
     */
    androidDevices: function() {
        if (Appc.info.android && Appc.info.android.devices) {
            return Appc.info.android.devices;
        }
        return [];
    },

    /**
     * Android targets
     * 
     * @return {Object}
     */
    androidTargets: function() {
        return {
            devices: this.androidDevices(),
            emulators: this.androidEmulators()
        }
    },

    /**
     * Windows emulators
     * 
     * @return {Array}
     */
    windowsEmulators: function() {
        if (Appc.info.windows && Appc.info.windows.emulators) {
            let emulators = [];
            for (let sdk in Appc.info.windows.emulators) {
                emulators = emulators.concat(Appc.info.windows.emulators[sdk]);
            }
            return emulators;
        }
        return [];
    },

    /**
     * Windows targets
     * 
     * @return {Object}
     */
    windowsTargets: function() {
        return {
            devices: [],
            emulators: this.windowsEmulators()
        }
    },


    //--------------------------------------------------------------------------------


    /**
     * iOS certificates
     * 
     * @param {String} type     developer, distribution
     * @return {Array}
     */
    iosCertificates: function(type = 'developer') {
        var certificates = [];
        if (Appc.info.ios && Appc.info.ios.certs) {
            for (let keychain in Appc.info.ios.certs.keychains) {
                certificates = certificates.concat(Appc.info.ios.certs.keychains[keychain][type]);
            }
        }
        return certificates;
    },

    /**
     * iOS provisioning profiles
     * 
     * @param {String} type         development, distribution, appstore
     * @param {Object} certificate  enable by matching certificate
     * @param {String} appId        enable by matching app ID
     * @return {Array}
     */
    iosProvisioningProfiles: function(deployment = 'development', certificate = {}, appId) {
        var pem;
        if (certificate.pem) {
            pem = certificate.pem.replace('-----BEGIN CERTIFICATE-----', '');
            pem = pem.replace('-----END CERTIFICATE-----', '');
            pem = pem.replace(/[\n\r]/g, '');
        }
        var profiles = [];
        if (Appc.info.ios && Appc.info.ios.provisioning) {
            
            var deploymentProfiles = [];
            if (deployment == 'development') {
                deploymentProfiles = Appc.info.ios.provisioning.development;
            } else if (deployment == 'distribution') {
                deploymentProfiles = Appc.info.ios.provisioning.adhoc;
                deploymentProfiles = deploymentProfiles.concat(Appc.info.ios.provisioning.enterprise);
            } else if (deployment == 'appstore') {
                deploymentProfiles = Appc.info.ios.provisioning.distribution;
            }

            deploymentProfiles.forEach(function(profile){
                profile.disabled = false;
                if (pem && profile.certs.indexOf(pem) == -1) {
                    profile.disabled = true;
                } else if (appId && !Utils.iOSProvisioinngProfileMatchesAppId(profile.appId, appId)) {
                    profile.disabled = true;
                }
                profiles.push(profile);
            });
        }
        return profiles;
    },


    //--------------------------------------------------------------------------------


    /**
     * run
     * 
     * @param {Object} opts
     * @param {Array} opts.args         arguments to pass to 'appc run' command
     * @param {Function} opts.log       output log callback
     * @param {Function} opts.error     error callback
     * @param {Function} opts.exit      exit callback
     * @return {Object}
     */
    run: function(opts) {
        var command = 'appc';
        var args = ['run'].concat(opts.args);
        var stdout = function(output) {
            opts.log && opts.log(output);
        };
        var stderr = function(output) {
            opts.error && opts.error(output);
        };
        var exit = function(code) {
            opts.exit && opts.exit(code);
        };
        var runProc = new BufferedProcess({command, args, stdout, stderr, exit});
        return runProc;
    },

    /**
     * generate
     * 
     * @param {Object} opts
     * @param {String} opts.type        what to generate (controller)
     * @param {String} opts.name        
     * @param {Function} opts.error
     */
    generate: function(opts) {
        var command = 'alloy';
        var options = {
            cwd: atom.project.getPaths()[0]
        };
        var args = ['generate', opts.type, opts.name];
        var stdout = function(output) {
            // options.log(output);
        };
        var stderr = function(output) {
            output = output.replace(/\[[0-9]+m/g, '');
            output = output.replace(/\[ERROR]/g, '');
            output = output.replace(/^\W+/g,'');
            output = output.charAt(0).toUpperCase() + output.slice(1);
            opts.error && opts.error({message: `Error generating ${opts.type} '${opts.name}'`,
                                      detail: output});
        };
        var exit = function(code) {

        };
        var runProc = new BufferedProcess({command, options, args, stdout, stderr, exit});
        return runProc;
    }
};

module.exports = Appc;
