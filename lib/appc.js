'use babel'

import {BufferedProcess} from 'atom';
import Toolbar from './toolbar/toolbar';
import Console from './toolbar/console';
import Ti from './ti';
import Tiapp from './tiapp';
import Arrow from './arrow';

var _toolbar;
var _console;
var _runProc;

export function activate() {

    // create UI elements
    _toolbar = new Toolbar('Appcelerator');
    _console = new Console();

    // add command hook for building / running
    atom.commands.add('atom-workspace', 'appc:run', function _run(){
        _console.clear();
        _console.show();
        if (Tiapp.isTitaniumProject) {
            buildTi();
        } else if (Arrow.isArrowProject) {
            runArrow();
        } else {

        }
    });

    atom.commands.add('atom-workspace', 'appc:stop', function _stop(){
        console.log('appc.stop()')
        _runProc.kill();
        _toolbar.hud.displayMessage({text: 'Ready'});
    });

    atom.project.onDidChangePaths(function(e){
        console.log('onDidChangePaths: ' + JSON.stringify(e, null, 4));
        loadProject();
    });

    Ti.getInfo(function(){
        _toolbar.populateiOSSimulators(Ti.iosSimulators());
        // _toolbar.populateAndroidAvds(Ti.genymotionAvds.bind(_toolbar));
    });

    loadProject();
}

export function loadProject() {
    // attempt Titanium project
    Tiapp.load();
    if (Tiapp.isTitaniumProject) {
        _toolbar.hud.displayMessage({
            icon: Tiapp.appIcon(),
            text: Tiapp.appName() + ' | ' + Tiapp.sdk(),
            default: true
        });
        _toolbar.setIcon(__dirname + '/../images/ti.png');
        return;
    }

    // attempt Arrow Builder project
    Arrow.load();
    if (Arrow.isArrowProject) {
        _toolbar.hud.displayMessage({
            // icon: Tiapp.appIcon(),
            text: Arrow.appName(),
            default: true
        });
        _toolbar.setIcon(__dirname + '/../images/arrow.png');
        return;
    }

    _toolbar.hud.displayMessage({
        text: 'Not a known project type',
        flash: true
    });
};

export function buildTi() {
    var selectedPlatform = _toolbar.platformSelect.selectedOption();
    var selectedSimulator = _toolbar.simulatorSelect.selectedOption();

    _toolbar.hud.displayMessage({
        text: 'Building Ti app for ' + selectedPlatform.text + '...',
        spinner: true
    });

    var options = {
        args: ['-p', selectedPlatform.value, '-d', atom.project.getPaths()[0], '-C', selectedSimulator.value],
        log: function(text){
            _console.write(text);
            if (text.indexOf('BUILD SUCCEEDED') != -1) {
                _toolbar.hud.displayMessage({
                    text: 'Build succeeded | Running app on ' + selectedSimulator.text,
                    flash: true
                });
            }
        },
        error: function(text){
            _console.write(text);
        }

    };
    _runProc = Ti.build(options);
}

export function runArrow() {
    _toolbar.hud.displayMessage({
        text: 'Running local Arrow server...',
        spinner: true
    });

    var command = 'appc';
    var args = ['run', '-d', atom.project.getPaths()[0]];
    var stdout = function(output) {
        console.log(output)
        _console.write(output);
    };
    var stderr = function(output) {
        console.error(output);
        _console.write(output);
    };
    var exit = function(code) { console.log(`'appc run' exited with #{code}"`) };
    _runProc = new BufferedProcess({command, args, stdout, stderr, exit});
}

// export const config = {
//   visible: {
//     type: 'boolean',
//     default: true,
//     order: 1
//   },
//   iconSize: {
//     type: 'string',
//     default: '24px',
//     enum: ['12px', '16px', '24px', '32px'],
//     order: 2
//   },
//   position: {
//     type: 'string',
//     default: 'Top',
//     enum: ['Top', 'Right', 'Bottom', 'Left'],
//     order: 3
//   },
//   fullWidth: {
//     type: 'boolean',
//     default: true,
//     order: 4
//   }
// };
//
// if (typeof atom.workspace.addHeaderPanel !== 'function') {
//   delete config.fullWidth;
// }
