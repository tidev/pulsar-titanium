'use babel'

import {BufferedProcess} from 'atom';
import {platform} from 'os';
import Toolbar from './toolbar/toolbar';
import Console from './toolbar/console';
import Ti from './ti';
import Tiapp from './tiapp';
import Arrow from './arrow';

var _toolbar;
var _console;
var _runProc;

export function activate() {

    loadProject();

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
        _runProc.kill();
        _toolbar.hud.displayDefault();
    });

    atom.commands.add('atom-workspace', 'appc:generate', function _generate(){
        createController();
    });

    atom.commands.add('atom-workspace', 'appc:console', function _generate(){
         _console.show();
    });

    atom.project.onDidChangePaths(function(e){
        console.log('onDidChangePaths: ' + JSON.stringify(e, null, 4));
        loadProject();
    });

    if (Tiapp.isTitaniumProject) {
        _toolbar.hud.displayMessage({
            text: 'Loading emulators...',
            spinner: true
        });
        Ti.getInfo(function() {
            if (platform() === 'darwin') {
                _toolbar.populateiOSSimulators(Ti.iosSimulators());
            } else {
                _toolbar.populateAndroidAvds(Ti.androidAvds());
            }
            // _toolbar.populateWindowsEmulators(Ti.windowsEmulators());

            _toolbar.hud.displayMessage({
                icon: Tiapp.appIcon(),
                text: Tiapp.appName() + ' | ' + Tiapp.sdk(),
                default: true
            });
        });
    }
}

export function loadProject() {
    // attempt Titanium project
    Tiapp.load();
    if (Tiapp.isTitaniumProject) {

        if (!_toolbar) {
            _toolbar = new Toolbar();
        }
        if (!_console) {
            _console = new Console();
        }

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
        text: 'Building for ' + selectedPlatform.text + '...',
        spinner: true
    });

    var options = {
        args: ['-p', selectedPlatform.value, '-d', atom.project.getPaths()[0], '-C', selectedSimulator.value],
        log: function(text){
            _console.write(text);
            if (text.indexOf('built successfully') != -1) {
                _toolbar.hud.displayMessage({
                    text: 'Built | Running on ' + selectedSimulator.text,
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

export function createController() {
    var miniEditor = document.createElement('atom-text-editor');
    miniEditor.setAttribute('placeholder-text', 'Controller name');
    miniEditor.setAttribute('mini', true);

    var inputPanel = atom.workspace.addModalPanel({
        item: miniEditor
    });
    miniEditor.focus();

    miniEditor.onkeyup = function(e) {
        var str = miniEditor.getModel().getText();
        if (e.keyCode == 27) { // Esc
            miniEditor.remove();
            inputPanel.destroy();
        } else if (str.length > 0 && e.keyCode == 13) {
            if (str !== "") {
                Ti.generate('controller', str);
            }
            miniEditor.remove();
            inputPanel.destroy();
        }

    };
}
