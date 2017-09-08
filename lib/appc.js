'use babel'

import {BufferedProcess} from 'atom';

var Appc = {

    info: {},

    /**
     * get info
     * 
     * param {Function} callback
     */
    getInfo: function(callback) {
        const spawn = require('child_process').spawn;
        const proc = spawn('appc', ['info', '-o', 'json'], {shell: true});

        var result = '';

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


    //--------------------------------------------------------------------------------


    iOSSimulators: function() {
        if (Appc.info.ios && Appc.info.ios.simulators) {
            return Appc.info.ios.simulators.ios;
        }
        return [];
    },

    iOSDevices: function() {
        if (Appc.info.ios && Appc.info.ios.devices) {
            return Appc.info.ios.devices;
        }
        return [];
    },

    iOSTargets: function() {
        return {
            devices: this.iOSDevices(),
            simulators: this.iOSSimulators()
        };
    },

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
        return [];
    },

    androidDevices: function() {
        if (Appc.info.android && Appc.info.android.devices) {
            return Appc.info.android.devices;
        }
        return [];
    },

    androidTargets: function() {
        return {
            devices: this.androidDevices(),
            emulators: this.androidEmulators()
        }
    },

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

    windowsTargets: function() {
        return {
            devices: [],
            emulators: this.windowsEmulators()
        }
    },


    //--------------------------------------------------------------------------------


    iosCertificates: function(type = 'developer') {
        var certificates = [];
        if (Appc.info.ios && Appc.info.ios.certs) {
            for (let keychain in Appc.info.ios.certs.keychains) {
                certificates = certificates.concat(Appc.info.ios.certs.keychains[keychain][type]);
            }
        }
        return certificates;
    },

    iosProvisioningProfiles: function(deployment = 'development', certificate = {}) {
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
            }

            deploymentProfiles.forEach(function(profile){
                if (pem && profile.certs.indexOf(pem) == -1) {
                    profile.disabled = true;
                } else {
                    profile.disabled = false;
                }
                profiles.push(profile);
            });
        }
        return profiles;
    },

    //--------------------------------------------------------------------------------


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
     * param {Object} opts
     * param {String} opts.type
     * param {String} opts.name
     * param {Function} opts.error
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
