'use babel'

import {BufferedProcess} from 'atom';

var Ti = {

    info: {},

    getInfo: function(callback) {
        // var command = 'ti';
        // var args = ['info', '-o', 'json'];
        // var stdout = function(output) { console.log(output) };
        // var exit = function(code) { console.log("'ti build -p ios' exited with code " + code) };
        // this.runProc = new BufferedProcess({command, args, stdout, exit});

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
          Ti.info = JSON.parse(result);
          callback(Ti.info);
        });
    },

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

    build: function(options) {
        var command = 'appc';
        var args = ['ti', 'build'].concat(options.args);
        var stdout = function(output) {
            options.log && options.log(output);
        };
        var stderr = function(output) {
            options.error && options.error(output);
        };
        var exit = function(code) {
            console.log(`'ti build' exited with #{code}"`)
            options.exit && options.exit(code);
        };
        var runProc = new BufferedProcess({command, args, stdout, stderr, exit});
        return runProc;
    },

    generate: function(type, name) {
        var command = 'alloy';
        var options = {
            cwd: atom.project.getPaths()[0]
        };
        var args = ['generate', type, name];
        var stdout = function(output) {
            // options.log(output);
        };
        var stderr = function(output) {
            // options.error(output);
        };
        var exit = function(code) {
            console.log(`'alloy generate' exited with #{code}"`)
        };
        var runProc = new BufferedProcess({command, options, args, stdout, stderr, exit});
        return runProc;
    }
};

module.exports = Ti;
