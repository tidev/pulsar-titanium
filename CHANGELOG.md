# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.14.0 (2021-02-15)


### Features

* **completion:** add completions for Ti namespace in controllers ([#177](https://github.com/appcelerator/atom-appcelerator-titanium/issues/177)) ([efa3085](https://github.com/appcelerator/atom-appcelerator-titanium/commit/efa3085412ab949c748549d5489a73ba51a44266)), closes [#171](https://github.com/appcelerator/atom-appcelerator-titanium/issues/171)
* **completions:** added completions for Alloy namespace in cont… ([#180](https://github.com/appcelerator/atom-appcelerator-titanium/issues/180)) ([61b7f0e](https://github.com/appcelerator/atom-appcelerator-titanium/commit/61b7f0edbb37572b29f6f0c0a36b39d4ff15852d)), closes [#179](https://github.com/appcelerator/atom-appcelerator-titanium/issues/179)
* **ios:** support generic apple certificates ([eb895b4](https://github.com/appcelerator/atom-appcelerator-titanium/commit/eb895b4881ce949f67a430802ca9bb812dc5294c)), closes [#183](https://github.com/appcelerator/atom-appcelerator-titanium/issues/183)
* **toolbar:** add user information and login icon ([#165](https://github.com/appcelerator/atom-appcelerator-titanium/issues/165)) ([a478274](https://github.com/appcelerator/atom-appcelerator-titanium/commit/a47827422c527342e75d8c27c9c6edda86171abf)), closes [#159](https://github.com/appcelerator/atom-appcelerator-titanium/issues/159)
* **update:** add node update and install functionality ([#328](https://github.com/appcelerator/atom-appcelerator-titanium/issues/328)) ([e01cc65](https://github.com/appcelerator/atom-appcelerator-titanium/commit/e01cc65b52247d48b260f735f728dc1bc58aa429))
* Add expire-date to dev-certs as well ([c22c3be](https://github.com/appcelerator/atom-appcelerator-titanium/commit/c22c3bebcfdd2c739f785abe438526906e247af2))
* add login dialog ([a3f9601](https://github.com/appcelerator/atom-appcelerator-titanium/commit/a3f9601c16236f06758560b39caa9cdbba7d3469))
* add open related to context menu ([#175](https://github.com/appcelerator/atom-appcelerator-titanium/issues/175)) ([0b62033](https://github.com/appcelerator/atom-appcelerator-titanium/commit/0b6203387675e5817b70051278d07df996fa9264)), closes [#174](https://github.com/appcelerator/atom-appcelerator-titanium/issues/174)
* add support for interaction via mac Touch Bar ([#124](https://github.com/appcelerator/atom-appcelerator-titanium/issues/124)) ([1fae584](https://github.com/appcelerator/atom-appcelerator-titanium/commit/1fae584367bcd487fabd1e76e331b1d0b691ea69))
* change the console icon to command line icon ([#178](https://github.com/appcelerator/atom-appcelerator-titanium/issues/178)) ([2674829](https://github.com/appcelerator/atom-appcelerator-titanium/commit/26748298fbc4d265cd874a07430f770845fd80cc))
* show login dialog if login is required to run command ([1e1168b](https://github.com/appcelerator/atom-appcelerator-titanium/commit/1e1168be9577f2c658290d9ed372934c0b272d49)), closes [#160](https://github.com/appcelerator/atom-appcelerator-titanium/issues/160)
* **toolbar:** add button and command to toggle toolbar visibility ([b871811](https://github.com/appcelerator/atom-appcelerator-titanium/commit/b871811e1e5413fb170eb6c08204735fc20a87b9)), closes [#138](https://github.com/appcelerator/atom-appcelerator-titanium/issues/138)
* **toolbar:** add config setting for showing toolbar, respect on open ([#151](https://github.com/appcelerator/atom-appcelerator-titanium/issues/151)) ([6fdae71](https://github.com/appcelerator/atom-appcelerator-titanium/commit/6fdae719baae7336f23ddcf042252bb8b88fec9b)), closes [#148](https://github.com/appcelerator/atom-appcelerator-titanium/issues/148)
* **updates:** add update functionality ([#162](https://github.com/appcelerator/atom-appcelerator-titanium/issues/162)) ([dad3a08](https://github.com/appcelerator/atom-appcelerator-titanium/commit/dad3a08b2c2766d884e9a5f66cea52f29a43e998))


### Bug Fixes

* **app creation:** fixed the app creation flow for newer sdks ([#167](https://github.com/appcelerator/atom-appcelerator-titanium/issues/167)) ([cda8014](https://github.com/appcelerator/atom-appcelerator-titanium/commit/cda8014af4d539fd4461f95eddefbf513d249e1c)), closes [#158](https://github.com/appcelerator/atom-appcelerator-titanium/issues/158)
* **autocomplete:** correct filtering of colors ([ffb340e](https://github.com/appcelerator/atom-appcelerator-titanium/commit/ffb340e227343b24b7115e2bacdb23ae2e39d5e5)), closes [#139](https://github.com/appcelerator/atom-appcelerator-titanium/issues/139)
* **commands/login:** fix detection of output ([57370bf](https://github.com/appcelerator/atom-appcelerator-titanium/commit/57370bf04297280b4444c66bf87d3009b8c6d77f))
* **completion:** handle array being returned from getCompletions ([bd01c01](https://github.com/appcelerator/atom-appcelerator-titanium/commit/bd01c0184c6c5509e96d8868d5d7948b31475abc)), closes [#188](https://github.com/appcelerator/atom-appcelerator-titanium/issues/188)
* **completions:** generate v3 for titanium and alloy completions ([#388](https://github.com/appcelerator/atom-appcelerator-titanium/issues/388)) ([eb8332a](https://github.com/appcelerator/atom-appcelerator-titanium/commit/eb8332a652bacd4fb02b8486ce8f7ea79699b96c))
* **completions:** read only properties are not shown ([#488](https://github.com/appcelerator/atom-appcelerator-titanium/issues/488)) ([9191220](https://github.com/appcelerator/atom-appcelerator-titanium/commit/9191220e46429eb6b19b206cbc5ee5357fe7548a))
* **definitions:** do not suggest app.tss when generating tss for id ([1fbf454](https://github.com/appcelerator/atom-appcelerator-titanium/commit/1fbf454c2da505ba981452876a0c43763fe2b18e)), closes [#141](https://github.com/appcelerator/atom-appcelerator-titanium/issues/141)
* **provider:** improve ordering of suggestions ([#156](https://github.com/appcelerator/atom-appcelerator-titanium/issues/156)) ([59bb539](https://github.com/appcelerator/atom-appcelerator-titanium/commit/59bb5399c9aa685715748ef0f58629c1d8da61b8)), closes [#143](https://github.com/appcelerator/atom-appcelerator-titanium/issues/143)
* **providers/tiapp:** handle an open xml file that isn't on disk ([d0243d1](https://github.com/appcelerator/atom-appcelerator-titanium/commit/d0243d1bb64e73f97d76419d572d7605ab6c1957)), closes [#284](https://github.com/appcelerator/atom-appcelerator-titanium/issues/284)
* **styleprovider:** improved suggestions to include quotes for color and layout properties ([#154](https://github.com/appcelerator/atom-appcelerator-titanium/issues/154)) ([f7128a8](https://github.com/appcelerator/atom-appcelerator-titanium/commit/f7128a878061817807936cb789ad40cc77370c5a)), closes [#152](https://github.com/appcelerator/atom-appcelerator-titanium/issues/152)
* **toolbar:** add titles to fields ([#135](https://github.com/appcelerator/atom-appcelerator-titanium/issues/135)) ([4514d57](https://github.com/appcelerator/atom-appcelerator-titanium/commit/4514d57cb74b192aa984e5b9f9616f779a831ef6))
* **toolbar/android:** handle emulators being undefined, improve ui when no emulators ([f439e71](https://github.com/appcelerator/atom-appcelerator-titanium/commit/f439e71e6cf61c9b5c4ae2857c88b0e92db3a921)), closes [#142](https://github.com/appcelerator/atom-appcelerator-titanium/issues/142)
* check for existence of type before trying to access properties ([ad4ebd2](https://github.com/appcelerator/atom-appcelerator-titanium/commit/ad4ebd2d328dd8875d976dc8158ddb380cd2ecf0)), closes [#126](https://github.com/appcelerator/atom-appcelerator-titanium/issues/126)
* Enable LiveView for custom args as well, address review comments ([83b3be8](https://github.com/appcelerator/atom-appcelerator-titanium/commit/83b3be87739012a2ed5c1cf4900a83d54eb5e3cb))

## 1.13.0 (2020-09-16)

This release updates titanium-editor-commons to fix a bug in the SDK install logic to ensure compatibility when installing the future 9.2.0.GA release

## [1.12.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.11.0...v1.12.0) (2020-09-02)

This release was made in error

## [1.11.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.10.1...v1.11.0) (2020-09-02)

### Bug Fixes

* **providers/tiapp:** handle an open xml file that isn't on disk ([1b5e749](https://github.com/appcelerator/atom-appcelerator-titanium/commit/1b5e749304865f1bbf9387e14290705573e440a2)), closes [#284](https://github.com/appcelerator/atom-appcelerator-titanium/issues/284)

### [1.10.1](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.9.1...v1.10.1) (2019-12-06)


### Bug Fixes

* **completion:** handle array being returned from getCompletions ([7780d98](https://github.com/appcelerator/atom-appcelerator-titanium/commit/7780d98)), closes [#188](https://github.com/appcelerator/atom-appcelerator-titanium/issues/188)


## [1.10.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.9.1...v1.10.0) (2019-11-07)


### Features

* change the console icon to command line icon ([#178](https://github.com/appcelerator/atom-appcelerator-titanium/issues/178)) ([b680220](https://github.com/appcelerator/atom-appcelerator-titanium/commit/b680220))
* **completion:** add completions for Ti namespace in controllers ([#177](https://github.com/appcelerator/atom-appcelerator-titanium/issues/177)) ([5785389](https://github.com/appcelerator/atom-appcelerator-titanium/commit/5785389)), closes [#171](https://github.com/appcelerator/atom-appcelerator-titanium/issues/171)
* **completions:** added completions for Alloy namespace in cont… ([#180](https://github.com/appcelerator/atom-appcelerator-titanium/issues/180)) ([1faec8c](https://github.com/appcelerator/atom-appcelerator-titanium/commit/1faec8c)), closes [#179](https://github.com/appcelerator/atom-appcelerator-titanium/issues/179)
* **ios:** support generic apple certificates ([d9e53a1](https://github.com/appcelerator/atom-appcelerator-titanium/commit/d9e53a1)), closes [#183](https://github.com/appcelerator/atom-appcelerator-titanium/issues/183)



### [1.9.1](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.9.0...v1.9.1) (2019-09-27)



## [1.9.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.8.0...v1.9.0) (2019-08-13)


### Bug Fixes

* **app creation:** fixed the app creation flow for newer sdks ([#167](https://github.com/appcelerator/atom-appcelerator-titanium/issues/167)) ([cda8014](https://github.com/appcelerator/atom-appcelerator-titanium/commit/cda8014)), closes [#158](https://github.com/appcelerator/atom-appcelerator-titanium/issues/158)


### Features

* **toolbar:** add user information and login icon ([#165](https://github.com/appcelerator/atom-appcelerator-titanium/issues/165)) ([a478274](https://github.com/appcelerator/atom-appcelerator-titanium/commit/a478274)), closes [#159](https://github.com/appcelerator/atom-appcelerator-titanium/issues/159)
* add open related to context menu ([#175](https://github.com/appcelerator/atom-appcelerator-titanium/issues/175)) ([0b62033](https://github.com/appcelerator/atom-appcelerator-titanium/commit/0b62033)), closes [#174](https://github.com/appcelerator/atom-appcelerator-titanium/issues/174)
* show login dialog if login is required to run command ([1e1168b](https://github.com/appcelerator/atom-appcelerator-titanium/commit/1e1168b)), closes [#160](https://github.com/appcelerator/atom-appcelerator-titanium/issues/160)



## 1.8.0 (2019-07-15)


### Bug Fixes

* **provider:** improve ordering of suggestions ([#156](https://github.com/appcelerator/atom-appcelerator-titanium/issues/156)) ([59bb539](https://github.com/appcelerator/atom-appcelerator-titanium/commit/59bb539)), closes [#143](https://github.com/appcelerator/atom-appcelerator-titanium/issues/143)

### Features
* **updates:** add update functionality ([#162](https://github.com/appcelerator/atom-appcelerator-titanium/issues/162)) ([dad3a08](https://github.com/appcelerator/atom-appcelerator-titanium/commit/dad3a08))
* add support for interaction via mac Touch Bar ([#124](https://github.com/appcelerator/atom-appcelerator-titanium/issues/124)) ([1fae584](https://github.com/appcelerator/atom-appcelerator-titanium/commit/1fae584))


<a name="1.7.0"></a>
# 1.7.0 (2019-05-08)


### Bug Fixes

* **styleprovider:** improved suggestions to include quotes for color and layout properties ([#154](https://github.com/appcelerator/atom-appcelerator-titanium/issues/154)) ([f7128a8](https://github.com/appcelerator/atom-appcelerator-titanium/commit/f7128a8)), closes [#152](https://github.com/appcelerator/atom-appcelerator-titanium/issues/152)


### Features

* **toolbar:** add config setting for showing toolbar, respect on open ([#151](https://github.com/appcelerator/atom-appcelerator-titanium/issues/151)) ([6fdae71](https://github.com/appcelerator/atom-appcelerator-titanium/commit/6fdae71)), closes [#148](https://github.com/appcelerator/atom-appcelerator-titanium/issues/148)



<a name="1.6.0"></a>
# [1.6.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.5.1...v1.6.0) (2019-03-28)


### Bug Fixes

* **autocomplete:** correct filtering of colors ([ffb340e](https://github.com/appcelerator/atom-appcelerator-titanium/commit/ffb340e)), closes [#139](https://github.com/appcelerator/atom-appcelerator-titanium/issues/139)
* **definitions:** do not suggest app.tss when generating tss for id ([1fbf454](https://github.com/appcelerator/atom-appcelerator-titanium/commit/1fbf454)), closes [#141](https://github.com/appcelerator/atom-appcelerator-titanium/issues/141)
* **toolbar:** add titles to fields ([#135](https://github.com/appcelerator/atom-appcelerator-titanium/issues/135)) ([4514d57](https://github.com/appcelerator/atom-appcelerator-titanium/commit/4514d57))
* **toolbar/android:** handle emulators being undefined, improve ui when no emulators ([f439e71](https://github.com/appcelerator/atom-appcelerator-titanium/commit/f439e71)), closes [#142](https://github.com/appcelerator/atom-appcelerator-titanium/issues/142)


### Features

* **toolbar:** add button and command to toggle toolbar visibility ([b871811](https://github.com/appcelerator/atom-appcelerator-titanium/commit/b871811)), closes [#138](https://github.com/appcelerator/atom-appcelerator-titanium/issues/138)



<a name="1.5.1"></a>
## [1.5.1](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.5.0...v1.5.1) (2019-01-02)


### Bug Fixes

* **commands/login:** fix detection of output ([57370bf](https://github.com/appcelerator/atom-appcelerator-titanium/commit/57370bf))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/appcelerator/atom-appcelerator-titanium/compare/v1.4.2...v1.5.0) (2018-12-19)


### Bug Fixes

* check for existence of type before trying to access properties ([ad4ebd2](https://github.com/appcelerator/atom-appcelerator-titanium/commit/ad4ebd2)), closes [#126](https://github.com/appcelerator/atom-appcelerator-titanium/issues/126)


### Features

* add login dialog ([a3f9601](https://github.com/appcelerator/atom-appcelerator-titanium/commit/a3f9601))


## 1.4.2

**26/10/18**

- Fixed error being thrown when tiapp.xml was saved in an invalid format (([#128]https://github.com/appcelerator/atom-appcelerator-titanium/issues/128))

## 1.4.1

**25/09/18**

- Fixed autocomplete issue when autocompleting the sdk-version tag in tiapp ([#119](https://github.com/appcelerator/atom-appcelerator-titanium/issues/119))
- Internal: Add GitHub issue templates ([#123](https://github.com/appcelerator/atom-appcelerator-titanium/pull/123))

## 1.4.0

**13/07/18**

- Added support for taking screenshots from the IDE ([#112](https://github.com/appcelerator/atom-appcelerator-titanium/pull/112), thanks to [@m1ga](https://github.com/m1ga))
- Internal: Added Travis CI to all pull requests ([#113](https://github.com/appcelerator/atom-appcelerator-titanium/pull/113))

## 1.3.0

**06/07/18**

- Added LiveView support  ([#108](https://github.com/appcelerator/atom-appcelerator-titanium/issues/108))
- Added expiration date to certificates **and** provisioning profiles ([#91](https://github.com/appcelerator/atom-appcelerator-titanium/issues/91))
- Fixed HUD-error  ([#103](https://github.com/appcelerator/atom-appcelerator-titanium/issues/103))
- Use `INFO` log-level by default, for parity with Studio  ([#90](https://github.com/appcelerator/atom-appcelerator-titanium/issues/90))
- Allow custom args to be saved across Atom sessions ([#114](https://github.com/appcelerator/atom-appcelerator-titanium/issues/114))

## 1.2.0

**01/07/18**

- Added support for cleaning the project via the toolbar ([#93](https://github.com/appcelerator/atom-appcelerator-titanium/pull/93), thanks to [@m1ga](https://github.com/m1ga))

## 1.1.1

**22/03/18**

- Default to latest SDK if none selected ([ATOM-66](https://jira.appcelerator.org/browse/ATOM-66))
- Improved Alloy create function snippets
- Fixed Slider tag autocomplete suggestion ([ATOM-70](https://jira.appcelerator.org/browse/ATOM-70))
- Fixed duplicate class suggestions and ignore blank values ([ATOM-67](https://jira.appcelerator.org/browse/ATOM-67))
- Fixed exception thrown when triggering class and ID autosuggestion ([ATOM-74](https://jira.appcelerator.org/browse/ATOM-74))

## 1.1.0

**14/02/18**

- Added support for creating new Titanium projects ([ATOM-37](https://jira.appcelerator.org/browse/ATOM-37))
- Added support for native module projects ([ATOM-38](https://jira.appcelerator.org/browse/ATOM-38))
- Added snippets support ([ATOM-11](https://jira.appcelerator.org/browse/ATOM-11))
- Added keyboard shortcuts for opening related Alloy files ([ATOM-39](https://jira.appcelerator.org/browse/ATOM-39))
- Added option to set full path to `appc` command ([ATOM-50](https://jira.appcelerator.org/browse/ATOM-50))
- Improved behaviour when non-Titanium project is open ([ATOM-40](https://jira.appcelerator.org/browse/ATOM-40))
- Improved tiapp.xml parsing ([ATOM-49](https://jira.appcelerator.org/browse/ATOM-49))
- Fixed triggering image autocompletion ([ATOM-43](https://jira.appcelerator.org/browse/ATOM-43))

## 1.0.3

**21/12/17**

- Fixed error on Linux - thanks @m1ga ([ATOM-34](https://jira.appcelerator.org/browse/ATOM-34))
- Fixed deprecation warnings ([ATOM-35](https://jira.appcelerator.org/browse/ATOM-35))
- Improve behaviour when Titanium project is not open ([ATOM-36](https://jira.appcelerator.org/browse/ATOM-35))

## 1.0.2

**09/12/17**

- Fixed issues with non-Titanium projects ([ATOM-33](https://jira.appcelerator.org/browse/ATOM-33))

## 1.0.1

**08/12/17**

- Fixed non-wildcard iOS provisioning profiles always being invalid ([ATOM-30](https://jira.appcelerator.org/browse/ATOM-30))
- Marking managed provisioning profiles as invalid ([ATOM-31](https://jira.appcelerator.org/browse/ATOM-31))
- Fixed provisioning profile ordering ([ATOM-32](https://jira.appcelerator.org/browse/ATOM-32))
- Fixed autocomplete error when creating styles for classes ([ATOM-28](https://jira.appcelerator.org/browse/ATOM-28))
- Updated publish option labelling
