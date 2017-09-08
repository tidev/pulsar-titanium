'use babel'

import {BufferedProcess} from 'atom';

var Ti = {

    info: {},

    getInfo: function(callback) {
        const spawn = require('child_process').spawn;
        const proc = spawn('appc', ['ti', 'info', '-o', 'json'], {shell: true});

        var result = '';

        proc.stdout.on('data', (data) => {
          result += data;
        });

        proc.stderr.on('data', (data) => {
          console.log(`stderr: ${data}`);
        });

        proc.on('close', (code) => {
            console.log(result);
            if (result && result.length) {
                Ti.info = JSON.parse(result);
                callback(Ti.info);
            } else {
                callback({});
            }

        });
    },


    //--------------------------------------------------------------------------------


    iOSSimulators: function() {
        if (Ti.info.ios && Ti.info.ios.simulators) {
            return Ti.info.ios.simulators.ios;
        }
        return [];
    },

    iOSDevices: function() {
        if (Ti.info.ios && Ti.info.ios.devices) {
            return Ti.info.ios.devices;
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
        if (Ti.info.android && Ti.info.android.emulators.length) {
            var emulators = {
                AVDs: [],
                Genymotion: []
            }
            Ti.info.android.emulators.forEach(function(emulator){
                if (emulator.type == 'avd') emulators.AVDs.push(emulator);
                else if (emulator.type == 'genymotion') emulators.Genymotion.push(emulator);
            });
            return emulators;
        }
        return [];
    },

    androidDevices: function() {
        if (Ti.info.android && Ti.info.android.devices) {
            return Ti.info.android.devices;
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
        if (Ti.info.windows && Ti.info.windows.emulators) {
            let emulators = [];
            for (let sdk in Ti.info.windows.emulators) {
                emulators = emulators.concat(Ti.info.windows.emulators[sdk]);
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
        if (Ti.info.ios && Ti.info.ios.certs) {
            for (let keychain in Ti.info.ios.certs.keychains) {
                certificates = certificates.concat(Ti.info.ios.certs.keychains[keychain][type]);
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
            console.log(pem);
        }
        var profiles = [];
        if (Ti.info.ios && Ti.info.ios.provisioning) {
            
            var deploymentProfiles = [];
            if (deployment == 'development') {
                deploymentProfiles = Ti.info.ios.provisioning.development;
            } else if (deployment == 'distribution') {
                deploymentProfiles = Ti.info.ios.provisioning.adhoc;
                deploymentProfiles = deploymentProfiles.concat(Ti.info.ios.provisioning.enterprise);
            }

            deploymentProfiles.forEach(function(profile){
                if (pem && profile.certs.indexOf(pem) == -1) {
                    profile.disabled = true;
                    console.log('No cert');
                } else {
                    profile.disabled = false;
                    console.log('Found cert');
                }
                profiles.push(profile);
            });
        }
        return profiles;
    },

    //--------------------------------------------------------------------------------


    build: function(opts) {
        var command = 'appc';
        var args = ['ti', 'build'].concat(opts.args);
        var stdout = function(output) {
            opts.log && opts.log(output);
        };
        var stderr = function(output) {
            opts.error && opts.error(output);
        };
        var exit = function(code) {
            console.log(`'ti build' exited with ${code}"`)
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
            console.log(`'alloy generate' exited with ${code}`)
        };
        var runProc = new BufferedProcess({command, options, args, stdout, stderr, exit});
        return runProc;
    }
};

module.exports = Ti;
