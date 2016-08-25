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
        const proc = spawn('ti', ['info', '-o', 'json']);

        var result = '';

        proc.stdout.on('data', (data) => {
        //   console.log(`stdout: ${data}`);
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

    iosSimulators: function() {
        if (Ti.info.ios.simulators) {
            return Ti.info.ios.simulators.ios;
        }
        return [];
    },

    genymotionAvds: function() {
        if (Ti.info.genymotion && Ti.info.genymotion.avds.length) {
            return Ti.info.genymotion.avds;
        }
        return [];
    },

    build: function(options) {
        var command = 'ti';
        var args = ['build'].concat(options.args);
        var stdout = function(output) {
            options.log(output);
        };
        var stderr = function(output) {
            options.error(output);
        };
        var exit = function(code) {
            console.log(`'ti build' exited with #{code}"`)
        };
        var runProc = new BufferedProcess({command, args, stdout, stderr, exit});
        return runProc;
    }
};

module.exports = Ti;
